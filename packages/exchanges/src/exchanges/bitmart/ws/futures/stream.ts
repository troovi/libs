import { EventDispatcher } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'
import { WebsocketBase } from '../../../../websocket'
import { BitmartFuturesMessages } from './messages'
import { streams } from './subscriptions'

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: BitmartFuturesMessages.OrderBook) => void
}

export class BitmartFuturesStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<boolean>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 110,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://openapi-ws-v2.bitmart.com/api?protocol=1.1`, {
          service: `bitmart:futures:${id}`,
          callbacks: {
            onOpen,
            onBroken,
            onMessage: (data) => {
              const raw = data.toString()
              const response = JSON.parse(raw)

              if (response.action === 'subscribe' || response.action === 'unsubscribe') {
                connection.logger.log(`Interaction message: ${raw}`, 'STREAM')
                this.responses.emit(`${response.action}:${response.group}`, true)
                return
              }

              if (response.error) {
                connection.logger.log(`Error message: ${raw}`, 'STREAM')
                this.responses.emit(`${response.action}:${response.group}`, false)
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
      subscribe: (connection, subscriptions) => {
        return this.request(connection, subscriptions, 'subscribe')
      },
      unsubscribe: (connection, subscriptions) => {
        return this.request(connection, subscriptions, 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, channels: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      connection.logger.verbose(`${method}: [${channels.length}]: ${channels.join(', ')}`, 'STREAM')

      let sizes = channels.length
      let allSuccess = true

      channels.forEach((channel) => {
        this.responses.on(`${method}:${channel}`, (isSuccess) => {
          this.responses.rm(`${method}:${channel}`)
          sizes--

          if (!isSuccess) {
            allSuccess = false
          }

          if (sizes === 0) {
            if (allSuccess) {
              resolve()
            } else {
              reject()
            }
          }
        })
      })

      connection.send({
        time: Date.now(),
        action: method,
        args: channels
      })
    })
  }
}
