import { EventBroadcaster, contain, generateCode, hash } from '@troovi/utils-js'
import { WebsocketBase } from './websocket'

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
  subscriptions: ChannelsService
}

interface Request {
  streams: string[]
  request: (connection: WebsocketBase, channels: string[]) => Promise<void>
}

interface Distribution {
  connectionID: string
  channels: string[]
}

namespace Processes {
  interface ActionOptions extends Request {
    onResolved: () => void
  }

  interface Processing extends Distribution {
    status: 'processing'
    close: () => void
  }

  interface Finished extends Distribution {
    status: 'finished'
  }

  /**
   * Subscription process
   */

  export class Subscription {
    public storeStreams: string[] = []
    public onCommited = new EventBroadcaster<void>()

    private streams: string[] = []
    private queries: (Processing | Finished)[] = []

    private subscribe: (connection: WebsocketBase, channels: string[]) => Promise<void>

    constructor(private network: NetworkManager, { streams, request, onResolved }: ActionOptions) {
      this.storeStreams = [...streams]
      this.streams = [...streams]
      this.subscribe = request

      const run = () => {
        this.execute().then(() => {
          if (this.streams.length === 0) {
            // commit channels
            const items = this.queries.map((query) => {
              if (query.status !== 'finished') {
                throw `query does not finished`
              }

              this.network.connections[query.connectionID].subscriptions.commitChannels(query.channels)

              return query.channels
            })
            // checking
            if (!isArrayEqual(streams, contain(items))) {
              throw `Streams does not equal: ${streams.join(',')} != ${contain(items).join(',')}`
            }
            // finish
            this.onCommited.emit()
            onResolved()
          } else {
            run()
          }
        })
      }

      run()
    }

    async execute(createConnection?: boolean) {
      if (this.streams.length > 0) {
        if (createConnection) {
          await this.network.addConnection()
        }

        // распределение каналов по существующим подключениям
        const distribution = this.network.distributeChannels(this.streams)

        // Promise.all обеспечивает параллельное выполнение запросов на подписку по distribution подключениям,
        // а также, в случае необходимости, создание нового подключения
        await Promise.all<void>([
          ...distribution.map(({ connectionID, channels }) => {
            const { stream } = this.network.connections[connectionID]

            return new Promise<void>(async (resolve) => {
              const query: Processing = { status: 'processing', channels, connectionID, close: resolve }

              this.queries.push(query)

              await this.subscribe(stream, channels).then(() => {
                this.queries = this.queries.filter((i) => i !== query)
                this.queries.push({ status: 'finished', channels, connectionID })

                resolve()
              })
            })
          }),
          // если функция distributeChannels не смогла распределить channels между существующими подключениями, значит, они полностью используют свои лимиты,
          // и необходимо создать новое подключение
          await this.execute(this.streams.length !== 0)
        ])
      }
    }

    abort(connectionID: string) {
      ;[...this.queries].forEach((query) => {
        if (query.connectionID === connectionID) {
          this.queries = this.queries.filter((i) => i !== query)
          this.streams.push(...query.channels)

          if (query.status === 'processing') {
            query.close() // разрешает промис позволяя выполниться execute
          }
        }
      })
    }
  }

  /**
   * Unsubscription process
   */

  export class Unsubscription {
    private queries: Processing[] = []

    constructor(private network: NetworkManager, { streams, request, onResolved }: ActionOptions) {
      this.network.getConnections(streams).then((connections) => {
        Promise.all(
          connections.map(({ channels, connectionID }) => {
            return new Promise<void>(async (resolve) => {
              this.queries.push({ status: 'processing', connectionID, channels, close: resolve })

              await request(this.network.connections[connectionID].stream, channels).then(() => {
                channels.forEach((channel) => {
                  this.network.connections[connectionID].subscriptions.closeChannel(channel)
                })

                resolve()
              })
            })
          })
        ).then(() => {
          onResolved()
        })
      })
    }

    // в случае если сбой подключения произойдет во время процесса отписки,
    // отписка не нуждается в повторной обработки, и должна быть успешна возвращена
    perform(connectionID: string) {
      this.queries.forEach((query) => {
        if (query.connectionID === connectionID) {
          query.close()
        }
      })
    }
  }
}

export class NetworkManager {
  public connections: { [connectionID: string]: Connection } = {}

  private onBroken: (channels: string[]) => void
  private connectionLimit: number
  private createConnection: ManagerOptions['createConnection']

  private isConnecting: boolean = false
  private onConnected = new EventBroadcaster<void>()

  private subscriptions: Processes.Subscription[] = []
  private unsubscriptions: Processes.Unsubscription[] = []

  constructor({ onBroken, connectionLimit, createConnection }: ManagerOptions) {
    this.onBroken = onBroken
    this.connectionLimit = connectionLimit
    this.createConnection = createConnection
  }

  async subscribe({ streams, request }: Request) {
    await new Promise<void>((resolve) => {
      const subscription = new Processes.Subscription(this, {
        streams,
        request,
        onResolved: () => {
          this.subscriptions = this.subscriptions.filter((item) => {
            return item !== subscription
          })

          resolve()
        }
      })

      this.subscriptions.push(subscription)
    })
  }

  async unsubscribe({ streams, request }: Request) {
    await new Promise<void>((resolve) => {
      const unsubscription = new Processes.Unsubscription(this, {
        streams,
        request,
        onResolved: () => {
          this.unsubscriptions = this.unsubscriptions.filter((item) => {
            return item !== unsubscription
          })

          resolve()
        }
      })

      this.unsubscriptions.push(unsubscription)
    })
  }

  // distribute channels by existing connections
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
  async getConnections(channels: string[]) {
    const connections: Distribution[] = []

    await Promise.all(
      this.subscriptions.map((subscription) => {
        return new Promise<void>((resolve) => {
          // в случае если подписка не завершена, необходимо дождаться ее завершения
          if (subscription.storeStreams.some((stream) => channels.includes(stream))) {
            subscription.onCommited.subscribe(resolve)
          } else {
            resolve()
          }
        })
      })
    )

    for (const connectionID in this.connections) {
      const buffer: string[] = []
      const { subscriptions } = this.connections[connectionID]

      ;[...channels].forEach((channel) => {
        if (subscriptions.channels[channel]) {
          if (subscriptions.channels[channel] !== 'commited') {
            throw `Channel "${channel}" should be commited`
          }

          channels = channels.filter((i) => i !== channel)
          buffer.push(channel)
        }
      })

      if (buffer.length > 0) {
        connections.push({ connectionID, channels: buffer })
      }
    }

    if (channels.length !== 0) {
      throw `Channels are not fully distributed`
    }

    // помечаем каналы как 'processing' чтобы при onBroken событии, они не были переинициализированы
    connections.forEach(({ connectionID, channels }) => {
      channels.forEach((channel) => {
        this.connections[connectionID].subscriptions.channels[channel] = 'processing'
      })
    })

    return connections
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

            const channels = subscriptions.getCommitedChannels()

            console.log('channels:', channels)

            if (stream.isConnected()) {
              stream.disconnect()
            }

            delete this.connections[connectionID]

            // обработка нереализованных подписок
            this.subscriptions.forEach((subscription) => {
              subscription.abort(connectionID)
            })
            // обработка нереализованных отписок
            this.unsubscriptions.forEach((unsubscription) => {
              unsubscription.perform(connectionID)
            })

            // передаем реализованные каналы
            this.onBroken(channels)
          }
        },
        onOpen: () => {
          this.connections[connectionID] = {
            stream: connection,
            subscriptions: new ChannelsService()
          }

          this.isConnecting = false
          this.onConnected.emit()

          resolve()
        }
      })
    })
  }
}

class ChannelsService {
  size: number = 0
  channels: { [channel: string]: 'commited' | 'processing' } = {}

  addChannels(channels: string[]) {
    channels.forEach((channel) => {
      // возможно при неправильной подписки на стрим, и не
      if (this.channels[channel]) {
        throw `channel exists: ${channel}`
      }

      this.size++
      this.channels[channel] = 'processing'
    })
  }

  commitChannels(channels: string[]) {
    channels.forEach((channel) => {
      if (this.channels[channel] !== 'processing') {
        throw `commit exists: ${channel}`
      }

      this.channels[channel] = 'commited'
    })
  }

  closeChannel(channel: string) {
    if (!this.channels[channel]) {
      throw `channel doesn't exists: ${channel}`
    }

    this.size--
    delete this.channels[channel]
  }

  getCommitedChannels() {
    const channels: string[] = []

    for (const channel in this.channels) {
      if (this.channels[channel] === 'commited') {
        channels.push(channel)
      }
    }

    return channels
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

export const isArrayEqual = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((ai) => b.includes(ai))
}
