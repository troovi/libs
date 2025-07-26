export interface List {
  [subscription: string]: (params: any) => string
}

// prettier-ignore
export type Info<T extends List> = { [K in keyof T]: { subscription: K; params: Parameters<T[K]>[0] } }[keyof T]

interface SubscriptionsOptions<T extends List, L, M extends true | false> {
  combinable: M
  streams: T
  getSubscriptions: (streams: string[]) => L
  getStreamInfo: (stream: string) => Info<T>
}

export class StreamsManager<T extends List = any, L = any, M extends true | false = any> {
  public streams: T
  public getSubscriptions: (streams: string[]) => L
  public getStreamInfo: (stream: string) => Info<T>

  constructor({ streams, getSubscriptions, getStreamInfo }: SubscriptionsOptions<T, L, M>) {
    this.streams = streams
    this.getSubscriptions = getSubscriptions
    this.getStreamInfo = getStreamInfo
  }
}

export type ExtractA<T> = T extends StreamsManager<infer A, infer B> ? A : never
export type ExtractB<T> = T extends StreamsManager<infer A, infer B> ? B : never
export type ExtractC<T> = T extends StreamsManager<infer A, infer B, infer C> ? C : never
