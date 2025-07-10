import { EventDispatcher } from '@troovi/utils-js'
import { BaseStream, NetworkManager } from '../../../../connections'
import { WebsocketBase } from '../../../../websocket'
import { GateSpotMessages } from './messages'
import { subscriptions } from './subscriptions'

interface Options {
  onBroken?: (channels: string[]) => void
  onMessage: (data: GateSpotMessages.OrderBookUpdate) => void
}

export class GateSpotStream extends BaseStream<typeof subscriptions> {
  private responses = new EventDispatcher<{ status: 'success' | 'error' }>()

  constructor({ onBroken, onMessage }: Options) {
    const network = new NetworkManager({
      onBroken,
      connectionLimit: 125,
      createConnection: (id, { onOpen, onBroken }) => {
        const connection = new WebsocketBase(`wss://api.gateio.ws/ws/v4/`, {
          service: `gate:spot:${id}`,
          callbacks: {
            onOpen,
            onBroken,
            onMessage: (data) => {
              const raw = data.toString()
              const response = JSON.parse(raw)

              if (response.event === 'subscribe' || response.event === 'unsubscribe') {
                connection.logger.log(`Interaction message: ${raw}`, 'STREAM')

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

    super(network, subscriptions, {
      subscribe: (connection, channels) => {
        return this.request(connection, JSON.parse(channels[0]), 'subscribe')
      },
      unsubscribe: (connection, channels) => {
        return this.request(connection, JSON.parse(channels[0]), 'unsubscribe')
      }
    })
  }

  private request(connection: WebsocketBase, params: Record<string, unknown>, method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = `${method}:${params.channel}:${JSON.stringify(params.payload)}`
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

      connection.send({ time: Date.now(), event: method, ...params })
    })
  }
}
