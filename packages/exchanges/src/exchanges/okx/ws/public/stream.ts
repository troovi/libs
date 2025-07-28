import { WebsocketBase } from '../../../../websocket'
import { getRandomIntString } from '../../../../utils'
import { NetworkManager } from '../../../../connections'
import { EventDispatcher } from '@troovi/utils-js'
import { streams } from './subscriptions'
import { OKXMessages } from './messages'
import { BaseStream } from '../../../../stream-manager'

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: OKXMessages.Books) => void
}

export class OKXPublicStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<{ event: string }>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://ws.okx.com:8443/ws/v5/public`, {
          service: `okx:public:${id}`,
          pingInterval: 5000,
          callbacks: {
            onOpen,
            onBroken,
            onPing: () => {
              connection.ping()
            },
            onMessage: (data) => {
              const message = data.toString()
              const response = JSON.parse(message)

              if (response.id) {
                connection.logger.log(`Interaction message: ${message}`, 'STREAM')
                this.responses.emit(response.id.toString(), response)

                return
              }

              if (response.event === 'error') {
                connection.logger.error(`Error: ${message}`, 'STREAM')
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
      subscribe: (connection, subscription) => {
        return this.request(connection, subscription, 'subscribe')
      },
      unsubscribe: (connection, subscription) => {
        return this.request(connection, subscription, 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, subscription: object, method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      connection.logger.verbose(`${method}: [${id}] ${JSON.stringify(subscription)}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message.event === method) {
          resolve()
        } else {
          connection.logger.error(JSON.stringify(message), method)
          reject()
        }
      })

      connection.send({
        id,
        op: method,
        args: [subscription]
      })
    })
  }
}
