import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { MexcFuturesMessages } from './messages'
import { Subscriptions, UnSubscribtions } from './subscriptions'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: MexcFuturesMessages.Depth) => void
  }
}

export class MexcFuturesPublicStream extends WebsocketBase {
  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://contract.mexc.com/edge`, {
      keepAlive,
      service: 'mexc-futures',
      callbacks: {
        ...callbacks,
        onOpen: () => {
          setInterval(() => {
            if (this.isConnected()) {
              this.send({ method: 'ping' })
            }
          }, 25000)

          callbacks.onOpen()
        },
        onMessage: (data) => {
          const message = JSON.parse(data.toString())

          if (message.channel) {
            if ((message.channel as string).startsWith('rs.')) {
              this.logger.log(`Interaction message: ${JSON.stringify(message)}`, 'STREAM')
              return
            }

            if (message.channel === 'pong') {
              this.logger.log(`Recieved "pong" message`, 'STREAM')
              return
            }
          }

          callbacks.onMessage(message)
        }
      }
    })
  }

  subscribe(getSubscriptions: (subscriptions: typeof Subscriptions) => object) {
    this.send(getSubscriptions(Subscriptions))
  }

  unsubscribe(getUnSubscriptions: (subscriptions: typeof UnSubscribtions) => object) {
    this.send(getUnSubscriptions(UnSubscribtions))
  }
}
