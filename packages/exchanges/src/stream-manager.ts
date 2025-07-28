import { nonNullable } from '@troovi/utils-js'
import { NetworkManager } from './connections'
import { toArray } from './utils'
import { WebsocketBase } from './websocket'

interface List {
  [subscription: string]: (params: any) => string
}

// prettier-ignore
type Info<T extends List> = { [K in keyof T]: { subscription: K; params: Parameters<T[K]>[0] } }[keyof T]

interface ManagerOptions<T extends List, L, M extends true | false> {
  combinable: M
  streams: T
  getSubscriptions: (streams: string[]) => L
  getStreamInfo: (stream: string) => Info<T>
}

export class StreamsManager<T extends List = any, L = any, M extends true | false = any> {
  public streams: T
  public getSubscriptions: (streams: string[]) => L
  public getStreamInfo: (stream: string) => Info<T>

  constructor({ streams, getSubscriptions, getStreamInfo }: ManagerOptions<T, L, M>) {
    this.streams = streams
    this.getSubscriptions = getSubscriptions
    this.getStreamInfo = getStreamInfo
  }
}

type ExtractA<T> = T extends StreamsManager<infer A, infer B> ? A : never
type ExtractB<T> = T extends StreamsManager<infer A, infer B> ? B : never
type ExtractC<T> = T extends StreamsManager<infer A, infer B, infer C> ? C : never

// service

interface Options<T> {
  subscribe: (connection: WebsocketBase, subscription: T) => Promise<void>
  unsubscribe: (connection: WebsocketBase, subscription: T) => Promise<void>
}

type Tun<B> = B extends true ? string | string[] : string

export class BaseStream<T extends StreamsManager, L extends List = ExtractA<T>, Is = ExtractC<T>> {
  public network: NetworkManager
  public streams: T

  constructor(network: NetworkManager, streams: T, private requests: Options<ExtractB<T>>) {
    this.network = network
    this.streams = streams
  }

  reboot({ subscription, params }: Info<L>) {
    return this.subscribe(subscription, (createStream) => createStream(params))
  }

  async subscribe<K extends keyof L>(subscription: K, getStreams: (createStream: L[K]) => Tun<Is>) {
    const streams = toArray(getStreams(this.streams.streams[subscription]))

    return this.network.subscribe({
      streams,
      request: (connection, channels) => {
        return this.requests.subscribe(connection, this.streams.getSubscriptions(channels))
      }
    })
  }

  async unsubscribe<K extends keyof L>(subscription: K, getStreams: (createStream: L[K]) => Tun<Is>) {
    const streams = toArray(getStreams(this.streams.streams[subscription]))

    return this.network.unsubscribe({
      streams,
      request: (connection, channels) => {
        return this.requests.unsubscribe(connection, this.streams.getSubscriptions(channels))
      }
    })
  }
}

type ExtractT<S> = S extends BaseStream<infer T> ? T : never

// prettier-ignore
export const reboot = async <T extends BaseStream<M>, M extends StreamsManager = ExtractT<T>, L extends List = ExtractA<M>>(stream: T, channels: string[], check: (item: Info<L>) => void | false) => {
  const streams = channels.map((channel) => {
    const info = stream.streams.getStreamInfo(channel)

    if (check(info) === false) {
      return null
    }

    return info
  })

  for await (const info of streams.filter(nonNullable)) {
    await stream.reboot(info)
  }
}
