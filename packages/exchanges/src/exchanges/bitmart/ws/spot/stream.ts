import { EventDispatcher } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'
import { WebsocketBase } from '../../../../websocket'
import { BitMartSpotMessages } from './messages'
import { subscriptions } from './subscriptions'

interface Options {
  onBroken?: (channels: string[]) => void
  onMessage: (data: BitMartSpotMessages.OrderBook) => void
}

// Each IP can maintain up to 20 connections with the BitMart public channel server
// Once connected, allows clients to subscribe to up to 115 channels per connection.

// Send message rate limit:
// Once connected: Clients can sending a maximum of 100 subscription messages within 10 seconds, message includes: PING text, JSON format messages (subscription and unsubscription).
// Once connected: A maximum of 20 messages arrays can be sent by clients for a single subscription.

export class BitMartSpotStream extends BaseStream<typeof subscriptions> {
  private responses = new EventDispatcher<boolean>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 110,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://ws-manager-compress.bitmart.com/api?protocol=1.1`, {
          service: `bitmart:spot:${id}`,
          callbacks: {
            onOpen,
            onBroken,
            onMessage: (data) => {
              const raw = data.toString()
              const response = JSON.parse(raw)

              if (response.event === 'subscribe' || response.event === 'unsubscribe') {
                connection.logger.log(`Interaction message: ${raw}`, 'STREAM')
                this.responses.emit(`${response.event}:${response.topic}`, true)
                return
              }

              if (response.errorCode) {
                connection.logger.log(`Error message: ${raw}`, 'STREAM')
                this.responses.emit(response.event, false)
                return
              }

              onMessage(response)
            }
          }
        })

        return connection
      }
    })

    super(network, subscriptions, {
      subscribe: (connection, channels) => {
        return this.request(connection, channels, 'subscribe')
      },
      unsubscribe: (connection, channels) => {
        return this.request(connection, channels, 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, channels: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      connection.logger.verbose(`${method}: [${channels.length}]: ${channels.join(', ')}`, 'STREAM')

      let sizes = channels.length

      channels.forEach((channel) => {
        this.responses.on(`${method}:${channel}`, (isSuccess) => {
          this.responses.rm(`${method}:${channel}`)

          if (isSuccess) {
            sizes--

            if (sizes === 0) {
              resolve()
            }
          } else {
            connection.logger.error(`${method}:${channel}`, method)

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
