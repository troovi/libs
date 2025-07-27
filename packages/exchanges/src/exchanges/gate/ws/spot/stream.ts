import { EventDispatcher } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'
import { WebsocketBase } from '../../../../websocket'
import { GateSpotMessages } from './messages'
import { streams } from './subscriptions'

interface Options {
  onBroken: (channels: string[]) => void
  onMessage: (data: GateSpotMessages.OrderBookUpdate) => void
}

export class GateSpotStream extends BaseStream<typeof streams> {
  private responses = new EventDispatcher<{ status: 'success' | 'error' }>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 125,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://api.gateio.ws/ws/v4/`, {
          service: `gate:spot:${id}`,
          pingInterval: 5000,
          callbacks: {
            onOpen,
            onBroken,
            onPing: () => {
              connection.ping()
            },
            onMessage: (data) => {
              const raw = data.toString()
              const response = JSON.parse(raw)

              if (response.event === 'subscribe' || response.event === 'unsubscribe') {
                connection.logger.log(
                  `Interaction message: ${response.channel}:${JSON.stringify(response.payload)}`,
                  'STREAM'
                )

                this.responses.emit(
                  `${response.event}:${response.channel}:${JSON.stringify(response.payload)}`,
                  response.result
                )

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

  private request(connection: WebsocketBase, subscription: Record<string, unknown>, method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = `${method}:${subscription.channel}:${JSON.stringify(subscription.payload)}`
      connection.logger.verbose(`${method}: ${id}`, 'STREAM')

      this.responses.on(id, ({ status }) => {
        this.responses.rm(id)

        if (status === 'success') {
          resolve()
        } else {
          connection.logger.error(`${id}: ${status}`, method)
          reject()
        }
      })

      connection.send({ time: Date.now(), event: method, ...subscription })
    })
  }
}
