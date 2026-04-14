import { IOpattern } from '@companix/utils-js'

type ValueOf<T> = T[keyof T]

interface RoutesSource {
  [route: string]: IOpattern<any>
}

type RoutesMap<B> = {
  [T in keyof B]: RoutesSource
}

type PropsMap<T extends Record<string, (props: any, ...args: any) => unknown>> = {
  [key in keyof T]: {
    params: Parameters<T[key]>[0]
    answer: Awaited<ReturnType<T[key]>>
  }
}

export type RoutesToEvents<T extends RoutesMap<unknown>> = ValueOf<{
  [context in keyof T]: ValueOf<{
    [service in keyof T[context]]: {
      domain: context
      service: service
      payload: T[context][service]
    }
  }>
}>

export type DomainToRoutes<Service extends Record<string, any>> = PropsMap<Pick<Service, keyof Service>>
export type WithLoopback<Params, T> = Params & { fallback?: T }
