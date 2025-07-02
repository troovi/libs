import { Subscriptions } from './subscriptions'
import { StreamEvents } from './messages'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'
import { getRandomIntString, toArray } from '../../../../utils'
import { EventDispatcher, splitByChunks } from '@troovi/utils-js'

interface Options {
  market: 'spot' | 'linear'
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: StreamEvents) => void
  }
}

export class ByBitStream extends WebsocketBase {
  private responses = new EventDispatcher<boolean>()
  private streams: string[] = []

  constructor({ market, keepAlive, callbacks }: Options) {
    super(`wss://stream.bybit.com/v5/public/${market}`, {
      service: `bybit-${market}`,
      keepAlive,
      callbacks: {
        ...callbacks,
        onMessage: (data) => {
          const response = JSON.parse(data.toString())

          if (response.req_id) {
            this.logger.log(`Interaction message: ${JSON.stringify(response)}`, 'STREAM')
            this.responses.emit(response.req_id.toString(), response.success)
            return
          }

          callbacks.onMessage(response)
        }
      }
    })
  }

  private request(params: any[], method: string) {
    return new Promise<void>((resolve, reject) => {
      const id = Number(getRandomIntString(8)).toString()

      this.logger.verbose(`${method}: [${id}] ${params.join(', ')}`, 'STREAM')

      this.responses.on(id, (message) => {
        this.responses.rm(id)

        if (message) {
          resolve()
        } else {
          this.logger.error(`Faild: request: ${id}`, method)
          reject()
        }
      })

      this.send({
        req_id: id,
        op: method,
        args: params
      })
    })
  }

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, 'subscribe').then(() => {
      this.streams.push(...streams)
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, 'unsubscribe').then(() => {
      this.streams = this.streams.filter((stream) => {
        return !streams.includes(stream)
      })
    })
  }

  async unsubscribeAll() {
    const subscriptions = splitByChunks(this.streams, 10)

    for await (const streams of subscriptions) {
      await this.request(streams, 'unsubscribe')
    }

    this.streams = []
  }
}
