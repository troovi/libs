import { EventDispatcher } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'
import { WebsocketBase } from '../../../../websocket'
import { BitgetPublicMessages } from './messages'
import { streams } from './subscriptions'

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: BitgetPublicMessages.OrderBook) => void
}

// Connection limit: 300 connection requests/IP/5min, Max 100 connections/IP
// Subscription limit: 240 subscription requests/Hour/connection, Max 1000 channel subscription/connection

export class BitgetPublicStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<boolean>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 150,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://ws.bitget.com/v2/ws/public`, {
          service: `bitget:public:${id}`,
          pingInterval: 8000,
          callbacks: {
            onBroken,
            onOpen,
            onPing: () => {
              connection.signal('ping')
            },
            onMessage: (data) => {
              const raw = data.toString()

              if (raw === 'pong') {
                // connection.logger.log(`Server "pong" captured`, 'STREAM')
                return
              }

              const response = JSON.parse(raw)

              if (response.event === 'subscribe' || response.event === 'unsubscribe') {
                connection.logger.log(`Interaction message: ${raw}`, 'STREAM')
                this.responses.emit(`${response.event}:${JSON.stringify(response.arg)}`, true)
                return
              }

              if (response.event === 'error') {
                connection.logger.error(`Error: ${raw}`, 'STREAM')
                this.responses.emit(`error:${JSON.stringify(response.arg)}`, false)
                return
              }

              onMessage(response)
            }
          }
        })

        return connection
      }
    })

    super(network, streams, {
      subscribe: async (connection, subscriptions) => {
        return this.request(connection, subscriptions, 'subscribe')
      },
      unsubscribe: async (connection, subscriptions) => {
        return this.request(connection, subscriptions, 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, channels: object[], method: string) {
    return new Promise<void>((resolve, reject) => {
      connection.logger.verbose(`${method}: ${JSON.stringify(channels)}`, 'STREAM')

      let sizes = channels.length

      channels.forEach((channel) => {
        const channelInfo = JSON.stringify(channel)

        this.responses.on(`${method}:${channelInfo}`, (isSuccess) => {
          this.responses.rm(`${method}:${channelInfo}`)

          if (isSuccess) {
            sizes--

            if (sizes === 0) {
              resolve()
            }
          } else {
            connection.logger.error(`${method}:${channelInfo}`, method)

            channels.forEach((channel) => {
              this.responses.rm(`${method}:${channel}`)
            })

            reject()
          }
        })
      })

      connection.send({
        time: Date.now(),
        op: method,
        args: channels
      })
    })
  }
}
