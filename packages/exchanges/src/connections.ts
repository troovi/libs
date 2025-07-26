import { EventBroadcaster, generateCode, hash } from '@troovi/utils-js'
import { WebsocketBase } from './websocket'
import { ExtractA, ExtractB, ExtractC, Info, StreamsManager, List } from './stream-manager'
import { toArray } from './utils'

interface Schema<S> {
  subscribe: (connection: WebsocketBase, subscription: S) => Promise<void>
  unsubscribe: (connection: WebsocketBase, subscription: S) => Promise<void>
}

type Tun<B> = B extends true ? string | string[] : string

export class BaseStream<T extends StreamsManager, L extends List = ExtractA<T>, Is = ExtractC<T>> {
  constructor(public network: NetworkManager, public streams: T, private schema: Schema<ExtractB<T>>) {}

  reboot({ subscription, params }: Info<L>) {
    return this.subscribe(subscription, (createStream) => createStream(params))
  }

  async subscribe<K extends keyof L>(subscription: K, getStreams: (createStream: L[K]) => Tun<Is>) {
    const streams = toArray(getStreams(this.streams.streams[subscription]))

    const fillChannels = async (createConnection?: boolean): Promise<void> => {
      if (streams.length > 0) {
        if (createConnection) {
          await this.network.addConnection()
        }

        const distribution = this.network.distributeChannels(streams)

        // Promise.all обеспечивает параллельное выполнение запросов на подписку по distribution подключениям,
        // а также, в случае необходимости, создание нового подключения
        await Promise.allSettled<void>([
          ...distribution.map(({ connectionID, channels }) => {
            const { stream, subscriptions } = this.network.connections[connectionID]
            return new Promise<void>(async (resolve, reject) => {
              await this.schema
                .subscribe(stream, this.streams.getSubscriptions(channels))
                .then(resolve)
                .catch((e) => {
                  // если в запросе на подписку был передан массив из множества streams, то при ошибке
                  // некоторые биржи отклоняют весь запрос, а некоторые (bitmart) пропускают подписки на проблемные стримы, при этом оставляя успешные.

                  // удаляя данные о стримах переданных в запросе, мы не можем быть точно уверены все ли стримы были отклонены, или только те в которых возникли проблемы
                  channels.forEach((channel) => {
                    subscriptions.closeChannel(channel)
                  })

                  // также, пока нет обрабатки reject после окончания allSettled. Даже при ошибках, subscribe проходит всегда успешно
                  // непонятно по каким причинам подписка/отписка может быть отклонена, и что делать в случае если отказ произошел (пытаться переподписываться, или возвращать ошибки)
                  reject(e)
                })
            })
          }),
          // если функция distributeChannels не смогла распределить channels между существующими подключениями, значит, они полностью используют свои лимиты,
          // и необходимо создать новое подключение
          await fillChannels(streams.length !== 0)
        ])
      }
    }

    await fillChannels()
  }

  async unsubscribe<K extends keyof L>(subscription: K, getStreams: (createStream: L[K]) => Tun<Is>) {
    const streams = toArray(getStreams(this.streams.streams[subscription]))
    const connections = this.network.getConnections(streams)
    const fails: string[] = []

    await Promise.allSettled(
      connections.map(({ channels, connection }) => {
        return new Promise<void>(async (resolve, reject) => {
          await this.schema
            .unsubscribe(connection.stream, this.streams.getSubscriptions(channels))
            .then(() => {
              channels.forEach((channel) => {
                connection.subscriptions.closeChannel(channel)
              })

              resolve()
            })
            .catch(() => {
              // отписка не произошла
              fails.push(...channels)
              reject()
            })
        })
      })
    )
  }
}

interface ConnectionCallbacks {
  onOpen: () => void
  onBroken: () => void
}

interface ManagerOptions {
  onBroken: (channels: string[]) => void
  connectionLimit: number
  createConnection: (id: string, cb: ConnectionCallbacks) => Promise<WebsocketBase> | WebsocketBase
}

interface Connection {
  stream: WebsocketBase
  subscriptions: ChannelsControl
}

interface Connections {
  [connectionID: string]: Connection
}

export class NetworkManager {
  public connections: Connections = {}

  private connectionLimit: number
  private onBroken: (channels: string[]) => void
  private createConnection: ManagerOptions['createConnection']

  private isConnecting: boolean = false
  private onConnected = new EventBroadcaster<void>()

  constructor({ onBroken, connectionLimit, createConnection }: ManagerOptions) {
    this.onBroken = onBroken
    this.connectionLimit = connectionLimit
    this.createConnection = createConnection
  }

  // distribute channels by connections
  distributeChannels(channels: string[]) {
    const store: { connectionID: string; channels: string[] }[] = []

    for (const connectionID in this.connections) {
      const connection = this.connections[connectionID]
      const available = this.connectionLimit - connection.subscriptions.size

      if (available > 0) {
        const channelsChunks = channels.splice(0, available)
        connection.subscriptions.addChannels(channelsChunks)

        store.push({ connectionID, channels: channelsChunks })
      }

      if (channels.length === 0) {
        break
      }
    }

    return store
  }

  // gets connections by channels
  getConnections(channels: string[]) {
    const connections: { [connectionID: string]: string[] } = {}

    for (const connectionID in this.connections) {
      const connection = this.connections[connectionID]

      channels.forEach((channel) => {
        if (connection.subscriptions.channels[channel]) {
          if (!connections[connectionID]) {
            connections[connectionID] = []
          }

          connections[connectionID].push(channel)
        }
      })
    }

    return Object.keys(connections).map((connectionID) => {
      return { connection: this.connections[connectionID], channels: connections[connectionID] }
    })
  }

  async addConnection() {
    if (this.isConnecting) {
      await new Promise<void>((resolve) => {
        this.onConnected.subscribe(resolve)
      })

      return
    }

    return new Promise<void>(async (resolve) => {
      const id = generateCode(4)
      const connectionID = `${id}:${hash()}`

      this.isConnecting = true

      const connection = await this.createConnection(id, {
        onBroken: () => {
          if (this.connections[connectionID]) {
            const { stream, subscriptions } = this.connections[connectionID]

            const channels = subscriptions.getChannels()

            if (stream.isConnected()) {
              stream.disconnect()
            }

            delete this.connections[connectionID]

            this.onBroken?.(channels)
          }
        },
        onOpen: () => {
          this.connections[connectionID] = {
            stream: connection,
            subscriptions: new ChannelsControl()
          }

          this.isConnecting = false
          this.onConnected.emit()

          resolve()
        }
      })
    })
  }
}

class ChannelsControl {
  size: number = 0
  channels: { [channel: string]: true } = {}

  addChannels(channels: string[]) {
    channels.forEach((channel) => {
      // возможно при неправильной подписки на стрим, и не
      if (this.channels[channel]) {
        throw `channel exists: ${channel}`
      }

      this.size++
      this.channels[channel] = true
    })
  }

  closeChannel(channel: string) {
    if (!this.channels[channel]) {
      throw `channel doesn't exists: ${channel}`
    }

    this.size--
    delete this.channels[channel]
  }

  getChannels() {
    return Object.keys(this.channels)
  }
}

// request size: 20

// {
//  [CON-1]: 8 / 10
//  [CON-2]: 9 / 10
//  [CON-3]: 5 / 10
// }

//  CON-1: 2
//  CON-2: 1
//  CON-3: 5
// +CON-4: 10
// +CON-5: 3
