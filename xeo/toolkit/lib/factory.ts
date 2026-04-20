import type { HttpAPI } from '@companix/utils-browser'
import { isPlainObject } from '@companix/utils-js'
import { CollectionScheme, Collections } from '@companix/xeo-scheme'
import { RoutesToEvents, WithLoopback } from './types'
import { IOpattern } from '@companix/xeo-types'

export abstract class BaseDomain<T extends CollectionScheme> {
  constructor(protected collections: Collections<T>) {}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Domain<S extends CollectionScheme, T, Routes = any> {
  initialize: (collections: Collections<S>) => T
}

export const createDomain = <ApiRoutes extends IOpattern<ApiRoutes>>() => {
  return <T, S extends CollectionScheme>(
    DomainService: new (collections: Collections<S>) => T
  ): Domain<S, T, ApiRoutes> => {
    return {
      initialize: (collections: Collections<S>) => new DomainService(collections)
    }
  }
}

export interface DomainsScheme {
  [domain: string]: Domain<any, any, any>
}

type ExtractRoutes<D> = D extends Domain<any, any, infer R> ? R : never

type RoutesToApi<R> = {
  [K in keyof R]: R[K] extends { params: infer P; answer: infer A } ? (params: P) => Promise<A> : never
}

type DomainsApi<T extends DomainsScheme> = {
  [domain in keyof T]: RoutesToApi<ExtractRoutes<T[domain]>>
}

type DomainRoutes<T extends DomainsScheme> = {
  [domain in keyof T]: ExtractRoutes<T[domain]>
}

const initializeDomains = <C extends Collections<any>, T extends DomainsScheme>(
  collections: C,
  scheme: T
) => {
  const domains: { [domain: string]: { [service: string]: (params: object) => Promise<void> } } = {}

  for (const domain in scheme) {
    domains[domain] = scheme[domain].initialize(collections)
  }

  const getParams = (params: object, answer: WithLoopback<unknown, object>) => {
    if (answer && isPlainObject(answer) && answer.fallback && isPlainObject(answer.fallback)) {
      return { ...params, ...answer }
    }

    return params
  }

  return {
    services: domains as { [K in keyof T]: T[K] extends Domain<any, infer S> ? S : never },
    createApi: (http: HttpAPI): DomainsApi<T> => {
      return new Proxy({} as DomainsApi<T>, {
        get(_, domain: string) {
          const domainService = domains[domain]

          return new Proxy({} as object, {
            get(_, method: string) {
              return async (params: object) => {
                const answer: WithLoopback<unknown, object> = await http.request({
                  method: 'POST',
                  url: domain + '/' + method,
                  body: params
                })

                await domainService[method](getParams(params, answer))

                return answer
              }
            }
          })
        }
      })
    },
    emit: ({ domain, service, payload }: RoutesToEvents<DomainRoutes<T>>) => {
      const domainService = domains[domain as string]

      if (domainService && domainService[service as string]) {
        domainService[service as string].call(domainService, getParams(payload.params, payload.answer))
      }
    }
  }
}

export { initializeDomains }
