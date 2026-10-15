/**
 * Клиентская сторона доменного слоя — реплика журнала: экземпляры доменов над локальной базой, очередь
 * событий с повтором через ленту, загрузка снимка сервера и API вызовов. Сокет подключает приложение:
 * события — `sync.push`, команда сервера и переподключение — `sync.resync`.
 */
import { Context, CounterCollection, CounterKey } from '../context'
import { DomainEvent, DomainRoutes, DomainsMap, initializeDomains, methodOf } from './helpers'
import { DomainsSnapshot } from './server'
import { EventSync } from '../sync'

/** HTTP-клиент вызовов; подходит `HttpAPI` из `@companix/utils-browser`. */
export interface DomainsTransport {
  request<T>(props: { method: 'POST'; url: string; body: unknown }): Promise<T>
}

/**
 * Типы вызовов — из сигнатур методов домена: параметры — первый аргумент метода, ответ — результат.
 * Схема параметров не должна менять форму значения (без `.default()`/`.transform()`): то, что
 * отправляет клиент, и то, что получает метод, — один тип.
 */
export type DomainsApi<T extends DomainsMap> = {
  [D in keyof T]: {
    [M in keyof DomainRoutes<T>[D]]: (
      params: DomainRoutes<T>[D][M]['params']
    ) => Promise<DomainRoutes<T>[D][M]['answer']>
  }
}

/** Источник данных реплики: коллекции и in-memory драйвер xeo, который загружает снимок. */
export interface ClientShellSource<C> {
  collections: C
  driver: { bootstrap(entities: never): void; tables: { bootstrap(tables: never): void } }
}

/**
 * Не-строковые ключи и `then` не становятся вызовами: иначе `await` или возврат прокси из
 * `async`-функции отправил бы `POST domains/<домен>/then`.
 */
const isMethodKey = (key: string | symbol): key is string => typeof key === 'string' && key !== 'then'

export interface ClientShellOptions<C> {
  /** Коллекция счётчиков: при повторе номера из ленты подтягивают её до выданных сервером. */
  counterCollection: CounterKey<C>
  /** Реплика разошлась с сервером (смена эпохи, разрыв ревизий, ошибка повтора) — перезагрузить. */
  resync: (reason: string) => void
  /** Сколько ждать недостающую ревизию, мс. */
  gapTimeout?: number
}

export const createClientShell = <T extends DomainsMap, C extends ConstructorParameters<T[keyof T]>[0]>(
  domains: T,
  dataSource: ClientShellSource<C>,
  options: ClientShellOptions<C>
) => {
  const services = initializeDomains(domains, dataSource.collections)
  const counter = dataSource.collections[options.counterCollection] as unknown as CounterCollection<any>

  const sync = new EventSync({
    /** Повтор события: контекст из события, лента должна быть прочитана целиком. */
    apply: async (event) => {
      const replay = Context.replay(counter, event.ctx)

      await methodOf(services, event)(event.params, replay.ctx)
      replay.finish()
    },
    resync: options.resync,
    gapTimeout: options.gapTimeout
  })

  return {
    /**
     * API вызовов `DomainsAPI.<домен>.<метод>(params)`: `POST domains/<домен>/<метод>` → событие
     * журнала → очередь → результат метода. Промис разрешается, когда событие применено локально, —
     * после `await` хуки уже видят изменения. До ответа сервера домен локально не выполняется.
     */
    createApi: (http: DomainsTransport) => {
      const call = async (domain: string, method: string, params: unknown) => {
        const event = await http.request<DomainEvent>({
          method: 'POST',
          url: `domains/${domain}/${method}`,
          body: params
        })

        sync.push(event)
        await sync.whenApplied(event.revision)

        return event.result
      }

      return new Proxy({} as DomainsApi<T>, {
        get(_, domain) {
          if (!isMethodKey(domain)) {
            return undefined
          }

          return new Proxy({} as Record<string, unknown>, {
            get(_, method) {
              if (!isMethodKey(method)) {
                return undefined
              }

              return (params: unknown) => call(domain, method, params)
            }
          })
        }
      })
    },
    /** Очередь событий журнала: события сокета (`push`), внешняя пересинхронизация (`resync`). */
    sync,
    /** Снимок сервера: документы и строки связей — в драйвер, очередь стартует с ревизии снимка. */
    load: (snapshot: DomainsSnapshot<object>) => {
      dataSource.driver.bootstrap(snapshot.entities as never)
      dataSource.driver.tables.bootstrap(snapshot.tables as never)
      sync.start(snapshot)
    }
  }
}
