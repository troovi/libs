import { toArray } from '../../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { BitgetPublicMessages } from './messages'
import { Subscriptions } from './subscriptions'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: BitgetPublicMessages.OrderBook) => void
  }
}

// Connection limit: 300 connection requests/IP/5min, Max 100 connections/IP
// Subscription limit: 240 subscription requests/Hour/connection, Max 1000 channel subscription/connection

export class BitgetPublicStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://ws.bitget.com/v2/ws/public`, {
      keepAlive,
      service: 'bitget-public',
      callbacks: {
        ...callbacks,
        onOpen: () => {
          setInterval(() => {
            if (this.isConnected()) {
              this.signal('ping')
            }
          }, 25000)

          callbacks.onOpen()
        },
        onMessage: (data) => {
          const raw = data.toString()

          if (raw === 'pong') {
            this.logger.log(`Server "pong" captured`, 'STREAM')
            return
          }

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

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => object | object[]) {
    const streams = toArray(getStreams(Subscriptions))

    return this.send({
      time: Date.now(),
      op: 'subscribe',
      args: streams
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => object | object[]) {
    const streams = toArray(getStreams(Subscriptions))

    return this.send({
      time: Date.now(),
      op: 'unsubscribe',
      args: streams
    })
  }
}
