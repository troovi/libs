/**
 * Помощники доменов: типы реестра, маршрутов и события журнала, экземпляры доменов над коллекциями и
 * поиск метода для вызова. Ими пользуются обе стороны — журнал (сервер) и реплика (клиент).
 */
import { DomainContext, ResolvedContext } from '../context'
import { DomainError } from '../error'

export interface DomainCall {
  domain: string
  method: string
  params: unknown
}

/** Событие журнала: вызов, контекст и результат; `epoch` — запуск сервера, `revision` — порядок. */
export interface DomainEvent<R = unknown> extends DomainCall {
  epoch: string
  revision: number
  ctx: ResolvedContext
  result: R
}

/** Реестр доменов: ключ — имя в маршруте, значение — класс с конструктором `(collections)`. */
export interface DomainsMap {
  [domain: string]: new (collections: any) => object
}

export type DomainServices<T extends DomainsMap> = { [K in keyof T]: InstanceType<T[K]> }

/** Маршруты доменов из сигнатур: метод → `{ params, answer }`, контекст в маршрут не входит. */
export type DomainRoutes<T extends DomainsMap> = {
  [D in keyof T]: {
    [M in keyof InstanceType<T[D]>]: InstanceType<T[D]>[M] extends (
      params: infer P,
      ...args: any[]
    ) => infer A
      ? { params: P; answer: Awaited<A> }
      : never
  }
}

type DomainMethod = (params: unknown, ctx: DomainContext<any, any>) => Promise<unknown>

/** Экземпляры доменов: на сервере — над базой, на реплике — над локальным источником. */
export const initializeDomains = <T extends DomainsMap>(
  domains: T,
  collections: ConstructorParameters<T[keyof T]>[0]
) => {
  const services = {} as DomainServices<T>

  for (const name in domains) {
    services[name] = new domains[name](collections) as DomainServices<T>[typeof name]
  }

  return services
}

const hasOwn = Object.prototype.hasOwnProperty

/**
 * Метод домена для вызова `methodOf(services, call)(call.params, ctx)`. Домен — собственный ключ
 * реестра, метод объявлен в самом классе домена: не унаследован (`toString`…) и не конструктор.
 * Какие методы публичны, решают маршруты (`DomainRoutes`): TS-`private` в рантайме не виден, поэтому
 * хелперы домена объявляются `private`, а вызовы приходят только из маршрутов сервера и его событий.
 */
export const methodOf = (services: object, { domain, method }: DomainCall): DomainMethod => {
  const registry = services as Record<string, Record<string, unknown>>
  const service = hasOwn.call(registry, domain) ? registry[domain] : null
  const declared =
    service !== null && method !== 'constructor' && hasOwn.call(Object.getPrototypeOf(service), method)

  if (!declared || typeof service[method] !== 'function') {
    throw new DomainError('notFound', `Operation ${domain}.${method} not found`)
  }

  return (service[method] as DomainMethod).bind(service)
}
