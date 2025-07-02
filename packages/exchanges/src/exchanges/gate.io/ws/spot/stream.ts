import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { GateSpotMessages } from './messages'
import { Subscriptions, UnSubscriptions } from './subscriptions'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: GateSpotMessages.OrderBookUpdate) => void
  }
}

export class GateSpotStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://api.gateio.ws/ws/v4/`, {
      keepAlive,
      service: 'gate.io-spot',
      callbacks: {
        ...callbacks,
        onMessage: (data) => {
          const raw = data.toString()
          const response = JSON.parse(raw)

          if (response.event === 'subscribe' || response.event === 'unsubscribe') {
            this.logger.log(`Interaction message: ${raw}`, 'STREAM')
            return
          }

          callbacks.onMessage(response)
        }
      }
    })
  }

  subscribe(getStream: (subscriptions: typeof Subscriptions) => object) {
    this.send({ time: Date.now(), ...getStream(Subscriptions) })
  }

  unsubscribe(getStream: (subscriptions: typeof UnSubscriptions) => object) {
    this.send({ time: Date.now(), ...getStream(UnSubscriptions) })
  }
}
