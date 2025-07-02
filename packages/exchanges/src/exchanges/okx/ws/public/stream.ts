import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { getRandomIntString, toArray } from '../../../../utils'
import { EventDispatcher } from '@troovi/utils-js'
import { Subscriptions } from './subscriptions'
import { OKXMessages } from './messages'

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: OKXMessages.Books) => void
  }
}

export class OKXPublicStream extends WebsocketBase {
  private responses = new EventDispatcher<{ event: string }>()
  private streams: object[] = []

  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://ws.okx.com:8443/ws/v5/public`, {
      service: 'okx-public',
      keepAlive,
      callbacks: {
        ...callbacks,
        onMessage: (data) => {
          const message = data.toString()
          const response = JSON.parse(message)

          if (response.id) {
            this.logger.log(`Interaction message: ${message}`, 'STREAM')
            this.responses.emit(response.id.toString(), response)

            return
          }

          if (response.event === 'error') {
            this.logger.error(`Error: ${message}`, 'STREAM')
            return
          }

          callbacks.onMessage(response)
        }
      }
    })
  }

  private request(stream: object, method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      this.logger.verbose(`${method}: [${id}] ${JSON.stringify(stream)}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message.event === method) {
          resolve()
        } else {
          this.logger.error(JSON.stringify(message), method)
          reject()
        }
      })

      this.send({
        id,
        op: method,
        args: [stream]
      })
    })
  }

  subscribe(getStream: (subscriptions: typeof Subscriptions) => object) {
    const stream = getStream(Subscriptions)

    return this.request(stream, 'subscribe').then(() => {
      this.streams.push(stream)
    })
  }

  unsubscribe(getStream: (subscriptions: typeof Subscriptions) => object) {
    const stream = getStream(Subscriptions)

    return this.request(stream, 'unsubscribe').then(() => {
      this.streams = this.streams.filter((s) => {
        return JSON.stringify(s) !== JSON.stringify(stream)
      })
    })
  }

  unsubscribeAll() {
    this.streams.forEach((stream) => {
      this.request(stream, 'unsubscribe').then(() => {
        this.streams = this.streams.filter((s) => {
          return JSON.stringify(s) !== JSON.stringify(stream)
        })
      })
    })
  }
}
