import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { GateFuturesMessages } from './messages'
import { Subscriptions, UnSubscriptions } from './subscriptions'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: GateFuturesMessages.OrderBookUpdate) => void
  }
}

export class GateFuturesStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://fx-ws.gateio.ws/v4/ws/usdt`, {
      keepAlive,
      service: 'gate.io-futures',
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
    return this.send({ time: Date.now(), ...getStream(Subscriptions) })
  }

  unsubscribe(getStream: (subscriptions: typeof UnSubscriptions) => object) {
    return this.send({ time: Date.now(), ...getStream(UnSubscriptions) })
  }
}
