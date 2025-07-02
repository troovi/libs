import { getRandomIntString, toArray } from '../../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../../websocket'

import { AnyBinanceMessage } from './messages'
import { Subscriptions } from './subscriptions'
import { EventDispatcher } from '@troovi/utils-js'

type Market = 'spot' | 'futures'

const APIs: Record<Market, string> = {
  spot: `wss://stream.binance.com:9443/ws`,
  futures: `wss://fstream.binance.com/ws`
}

interface Options<M extends Market> {
  market: M
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: AnyBinanceMessage<M>, rawMsg: string) => void
  }
}

export class BinancePublicStream<M extends Market> extends WebsocketBase {
  private responses = new EventDispatcher<null>()
  private streams: string[] = []

  constructor({ market, keepAlive, callbacks }: Options<M>) {
    super(APIs[market], {
      keepAlive,
      service: `binance-${market}`,
      callbacks: {
        ...callbacks,
        onMessage: (data) => {
          const raw = data.toString()
          const response = JSON.parse(raw)

          if (response.code !== undefined || response.error !== undefined) {
            this.logger.error(`Error message: ${JSON.stringify(response)}`, 'STREAM')
            callbacks.onBroken?.()
            return
          }

          if (response.result !== undefined) {
            this.logger.log(`Interaction message: ${raw}`, 'STREAM')
            this.responses.emit(response.id.toString(), response.result)

            return
          }

          callbacks.onMessage(response, raw)
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

        if (message === null) {
          resolve()
        } else {
          this.logger.error(message, method)
          reject()
        }
      })

      this.send({ id: +id, method, params })
    })
  }

  setProperty(event: 'combined', value: boolean) {
    return this.request([event, value], 'SET_PROPERTY')
  }

  subscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, 'SUBSCRIBE').then(() => {
      this.streams.push(...streams)
    })
  }

  unsubscribe(getStreams: (subscriptions: typeof Subscriptions) => string[] | string) {
    const streams = toArray(getStreams(Subscriptions))

    return this.request(streams, 'UNSUBSCRIBE').then(() => {
      this.streams = this.streams.filter((stream) => {
        return !streams.includes(stream)
      })
    })
  }

  unsubscribeAll() {
    return this.request(this.streams, 'UNSUBSCRIBE').then(() => {
      this.streams = []
    })
  }
}
