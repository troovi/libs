import { toArray } from '../../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { BitMartFuturesMessages } from './messages'
import { Subscriptions } from './subscriptions'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: BitMartFuturesMessages.OrderBook) => void
  }
}

export class BitMartFuturesStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://openapi-ws-v2.bitmart.com/api?protocol=1.1`, {
      keepAlive,
      service: 'bitmart-futures',
      callbacks: {
        ...callbacks,
        onMessage: (data) => {
          const raw = data.toString()
          const response = JSON.parse(raw)

          if (response.action === 'subscribe' || response.action === 'unsubscribe') {
            this.logger.log(`Interaction message: ${raw}`, 'STREAM')
            return
          }

          callbacks.onMessage(response)
        }
      }
    })
  }

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => string | string[]) {
    const streams = toArray(getStreams(Subscriptions))

    return this.send({
      time: Date.now(),
      action: 'subscribe',
      args: streams
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => string | string[]) {
    const streams = toArray(getStreams(Subscriptions))

    return this.send({
      time: Date.now(),
      action: 'unsubscribe',
      args: streams
    })
  }
}
