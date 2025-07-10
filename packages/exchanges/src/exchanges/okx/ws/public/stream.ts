import { WebsocketBase } from '../../../../websocket'
import { getRandomIntString } from '../../../../utils'
import { BaseStream, NetworkManager } from '../../../../connections'
import { EventDispatcher } from '@troovi/utils-js'
import { subscriptions } from './subscriptions'
import { OKXMessages } from './messages'

interface Options {
  onBroken?: (channels: string[]) => void
  onMessage: (data: OKXMessages.Books) => void
}

export class OKXPublicStream extends BaseStream<typeof subscriptions> {
  private responses = new EventDispatcher<{ event: string }>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 100,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://ws.okx.com:8443/ws/v5/public`, {
          service: `okx:public:${id}`,
          callbacks: {
            onOpen,
            onBroken,
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

    super(network, subscriptions, {
      subscribe: (connection, channels) => {
        return this.request(connection, channels, 'subscribe')
      },
      unsubscribe: (connection, channels) => {
        return this.request(connection, channels, 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, streams: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()
      const sub = JSON.parse(streams[0])

      connection.logger.verbose(`${method}: [${id}] ${JSON.stringify(sub)}`, 'STREAM')

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
        args: [sub]
      })
    })
  }
}
