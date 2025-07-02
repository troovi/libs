import { toArray } from '../../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { BitMartSpotMessages } from './messages'
import { Subscriptions } from './subscriptions'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: BitMartSpotMessages.OrderBook) => void
  }
}

// Each IP can maintain up to 20 connections with the BitMart public channel server
// Once connected, allows clients to subscribe to up to 115 channels per connection.

// Send message rate limit:
// Once connected: Clients can sending a maximum of 100 subscription messages within 10 seconds, message includes: PING text, JSON format messages (subscription and unsubscription).
// Once connected: A maximum of 20 messages arrays can be sent by clients for a single subscription.

export class BitMartSpotStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://ws-manager-compress.bitmart.com/api?protocol=1.1`, {
      keepAlive,
      service: 'bitmart-spot',
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

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => string | string[]) {
    const streams = toArray(getStreams(Subscriptions))

    return this.send({
      time: Date.now(),
      op: 'subscribe',
      args: streams
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => string | string[]) {
    const streams = toArray(getStreams(Subscriptions))

    return this.send({
      time: Date.now(),
      op: 'unsubscribe',
      args: streams
    })
  }
}
