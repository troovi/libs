import { streams } from './subscriptions'
import { StreamEvents } from './messages'
import { WebsocketBase } from '../../../../websocket'
import { getRandomIntString } from '../../../../utils'
import { EventDispatcher } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: StreamEvents) => void
}

export class ByBitStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<boolean>()

  constructor(market: 'spot' | 'linear', { onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 150,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://stream.bybit.com/v5/public/${market}`, {
          service: `bybit:${market}:${id}`,
          pingInterval: 8000,
          callbacks: {
            onOpen,
            onBroken,
            onPing: () => {
              connection.ping()
            },
            onMessage: (data) => {
              const response = JSON.parse(data.toString())

              if (response.req_id) {
                connection.logger.log(`Interaction message: ${JSON.stringify(response)}`, 'STREAM')
                this.responses.emit(response.req_id.toString(), response.success)
                return
              }

              if (response.success === false) {
                console.log(response)
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

  private request(connection: WebsocketBase, subscriptions: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      connection.logger.verbose(`${method}: [${id}] ${subscriptions.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message) {
          resolve()
        } else {
          connection.logger.error(`Faild: request: ${id}`, method)
          reject()
        }
      })

      connection.send({
        req_id: id,
        op: method,
        args: subscriptions
      })
    })
  }
}
