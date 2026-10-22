/**
 * Серверная сторона доменного слоя — журнал событий. Вызовы выполняются строго по одному: актор, момент
 * и лента идентификаторов записываются в контекст, событие получает ревизию и уходит репликам. Снимок
 * базы берётся в той же очереди, поэтому его ревизия точна. Транспорт, авторизацию и часовой пояс
 * задаёт приложение через опции; фреймворк (NestJS и т. п.) остаётся снаружи.
 */
import { hash, QueueManager } from '@companix/utils-js'
import type { TableRow } from '@companix/xeo-scheme'
import { Context, CounterCollection, CounterKey } from '../context'
import {
  DomainCall,
  DomainEvent,
  DomainRoutes,
  DomainsMap,
  initializeDomains,
  methodOf
} from './helpers'

/** Снимок базы для реплики: эпоха и ревизия снятия, документы коллекций и строки связей. */
export interface DomainsSnapshot<Entities = { [collection: string]: object[] }> {
  epoch: string
  revision: number
  entities: Entities
  tables: { [table: string]: TableRow[] }
}

/** Документы коллекций снимка — по типам чтений `getAll`. */
export type SnapshotEntities<C> = {
  [K in keyof C]: C[K] extends { getAll: (...args: never[]) => unknown }
    ? Awaited<ReturnType<C[K]['getAll']>>
    : never
}

/**
 * Источник данных журнала: коллекции и драйвер, выгружающий строки таблиц связей (`tables.getTables()`
 * Mongo-драйвера xeo-server; у базового драйвера это отладочное состояние, а не строки).
 */
export interface ServerShellSource<C> {
  collections: C
  driver: { tables: { getTables(): unknown } }
}

/** Вызов упал после первой записи: часть изменений уже в базе — реплики пересинхронизируются. */
export interface PartialWrite {
  call: DomainCall
  /** Успешных записей вызова (без счётчиков идентификаторов). */
  mutations: number
  error: unknown
}

export interface ServerShellOptions<C, Identity, Actor> {
  /** Коллекция счётчиков числовых идентификаторов; её записи не считаются частичной записью. */
  counterCollection: CounterKey<C>
  /**
   * Актор по идентичности из запроса (например, из JWT). Вызывается внутри очереди — права читаются уже
   * после предыдущих вызовов; бросает, если доступа нет. Идентичность `null` — система, актор `null`.
   */
  resolveActor: (identity: Identity) => Actor | Promise<Actor>
  /** Дата `YYYY-MM-DD` момента `at` в часовом поясе приложения. */
  today: (at: number) => string
  /** Рассылка события всем репликам (включая вызывающую — она отбросит дубль по ревизии). */
  broadcast: (event: DomainEvent) => void
  /** Частичная запись: залогировать и разослать репликам команду пересинхронизации. */
  onPartialWrite: (info: PartialWrite) => void
  /** Документ базы → вид для снимка (например, без служебных `_id`/`__v`). По умолчанию — как есть. */
  serialize?: <D extends object>(document: D) => D
}

export interface RunOptions {
  /** Момент вызова, мс; по умолчанию — сейчас. */
  at?: number
}

const MUTATIONS = new Set(['create', 'update', 'remove', 'changeDiscriminator'])

/** Коллекции, которые считают успешные записи текущего вызова (коллекция счётчиков не считается). */
const trackMutations = <C>(collections: C, skip: PropertyKey, onMutation: () => void): C =>
  new Proxy(collections as object, {
    get(target, name) {
      const collection = (target as Record<PropertyKey, Record<string, unknown>>)[name]

      if (name === skip) {
        return collection
      }

      return new Proxy(collection, {
        get(inner, method: string) {
          const member = inner[method]

          if (typeof member !== 'function') {
            return member
          }

          if (!MUTATIONS.has(method)) {
            return (member as (...args: unknown[]) => unknown).bind(inner)
          }

          return async (...args: unknown[]) => {
            const result = await (member as (...args: unknown[]) => Promise<unknown>).apply(inner, args)

            if (result === true) {
              onMutation()
            }

            return result
          }
        }
      })
    }
  }) as C

export const createServerShell = <
  T extends DomainsMap,
  C extends ConstructorParameters<T[keyof T]>[0],
  Identity,
  Actor
>(
  domains: T,
  dataSource: ServerShellSource<C>,
  options: ServerShellOptions<C, Identity, Actor>
) => {
  /** Идентификатор запуска: после перезапуска реплики пересинхронизируются. */
  const epoch = hash()
  const queue = new QueueManager()
  const serialize = options.serialize ?? (<D extends object>(document: D) => document)
  const counter = dataSource.collections[options.counterCollection] as unknown as CounterCollection<any>

  let revision = 0
  let mutations = 0

  const collections = trackMutations(dataSource.collections, options.counterCollection, () => {
    mutations += 1
  })

  const services = initializeDomains(domains, collections)

  /**
   * Выполнить вызов от имени идентичности или системы (`null`); ответ — событие журнала. `opts.at` —
   * момент вызова вместо текущего (посев истории, проигрывание прошлого): от него же считается `today`,
   * реплики получают его в контексте события как обычно.
   */
  const run = <D extends keyof T & string, M extends keyof DomainRoutes<T>[D] & string>(
    call: { domain: D; method: M; params: DomainRoutes<T>[D][M]['params'] },
    identity: Identity | null,
    opts: RunOptions = {}
  ) => {
    return queue.add(async () => {
      const actor = identity === null ? null : await options.resolveActor(identity)
      const at = opts.at ?? Date.now()
      const recording = Context.record(counter, { actor, at, today: options.today(at) })

      mutations = 0

      try {
        const result = await methodOf(services, call)(call.params, recording.ctx)

        const event: DomainEvent<DomainRoutes<T>[D][M]['answer']> = {
          epoch,
          revision: ++revision,
          domain: call.domain,
          method: call.method,
          params: call.params,
          ctx: recording.resolve(),
          result: result as DomainRoutes<T>[D][M]['answer']
        }

        options.broadcast(event)
        return event
      } catch (error) {
        if (mutations > 0) {
          options.onPartialWrite({ call, mutations, error })
        }

        throw error
      }
    })
  }

  /** Снимок базы между вызовами — его ревизия точна. */
  const snapshot = () => {
    return queue.add(async (): Promise<DomainsSnapshot<SnapshotEntities<C>>> => {
      const source = dataSource.collections as unknown as Record<string, { getAll(): unknown }>
      const entities = {} as Record<string, object[]>

      for (const name of Object.keys(source)) {
        entities[name] = ((await source[name].getAll()) as object[]).map(serialize)
      }

      const tables = (await dataSource.driver.tables.getTables()) as DomainsSnapshot['tables']

      for (const name in tables) {
        tables[name] = tables[name].map(serialize)
      }

      return { epoch, revision, entities: entities as SnapshotEntities<C>, tables }
    })
  }

  return {
    epoch,
    /** Последняя выданная ревизия. */
    get revision() {
      return revision
    },
    run,
    snapshot
  }
}
