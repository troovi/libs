import { areArraysEqual, getRandomIntString, toArray } from '../../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'

import { AnyOrangeXPubblicMessage } from './messages'
import { Subscriptions } from './subscriptions'
import { EventDispatcher } from '@troovi/utils-js'

interface Response<T> {
  method: 'subscription'
  jsonrpc: '2.0'
  params: T
}

interface Options {
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: Response<AnyOrangeXPubblicMessage>) => void
  }
}

export class OrangeXPublicStream extends WebsocketBase {
  private responses = new EventDispatcher<any>()
  private streams: string[] = []

  constructor({ keepAlive, callbacks }: Options) {
    super(`wss://api.orangex.com/ws/api/v1`, {
      keepAlive,
      service: `orangex-public`,
      callbacks: {
        ...callbacks,
        onOpen: () => {
          setInterval(() => {
            if (this.isConnected()) {
              this.signal('PING')
            }
          }, 5000)

          callbacks.onOpen()
        },
        onMessage: (data) => {
          const raw = data.toString()

          if (raw === 'PONG') {
            this.logger.log(`Server "pong" captured`, 'STREAM')
            return
          }

          const response = JSON.parse(raw)

          if (response.id !== undefined) {
            if (response.error !== undefined) {
              this.logger.error(`Interaction error: ${JSON.stringify(response.error)}`, 'STREAM')
              this.responses.emit(response.id.toString(), response.result)

              return
            }

            this.logger.log(`Interaction message: ${JSON.stringify(response.result)}`, 'STREAM')
            this.responses.emit(response.id.toString(), response.result)

            return
          }

          callbacks.onMessage(response)
        }
      }
    })
  }

  private request(streams: string[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      this.logger.verbose(`${method}: [${id}] ${streams.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (Array.isArray(message) && areArraysEqual(streams, message)) {
          resolve()
        } else {
          this.logger.error(message, method)
          reject()
        }
      })

      this.send({
        jsonrpc: '2.0',
        id: +id,
        method,
        params: {
          channels: streams
        }
      })
    })
  }

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, '/public/subscribe').then(() => {
      this.streams.push(...streams)
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, '/public/unsubscribe').then(() => {
      this.streams = this.streams.filter((stream) => {
        return !streams.includes(stream)
      })
    })
  }

  unsubscribeAll() {
    if (this.streams.length > 0) {
      this.request(this.streams, '/public/unsubscribe').then(() => {
        this.streams = []
      })
    }
  }
}
