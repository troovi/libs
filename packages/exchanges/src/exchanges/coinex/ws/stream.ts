import { getRandomIntString } from '../../../utils'
import { WebSocketCallbacks, WebsocketBase } from '../../../websocket'

import { CoinExMessages } from './messages'
import { EventDispatcher } from '@troovi/utils-js'
import { gunzip } from 'zlib'

const APIs = {
  spot: `wss://socket.coinex.com/v2/spot`,
  futures: `wss://socket.coinex.com/v2/futures`
}

interface Options {
  market: 'spot' | 'futures'
  keepAlive?: boolean
  callbacks: WebSocketCallbacks & {
    onMessage: (data: CoinExMessages.Depth) => void
  }
}

interface SubscribeDepth {
  symbol: string
  level: 5 | 10 | 20 | 50
  isFull?: boolean
}

export class CoinExStream extends WebsocketBase {
  private responses = new EventDispatcher<string>()

  constructor({ market, keepAlive, callbacks }: Options) {
    super(APIs[market], {
      keepAlive,
      service: `coinex-${market}`,
      callbacks: {
        ...callbacks,
        onOpen: () => {
          // Maintain the connection
          setInterval(() => {
            if (this.isConnected()) {
              this.send({ method: 'server.ping', id: +getRandomIntString(8), params: {} })
            }
          }, 15000)

          callbacks.onOpen()
        },
        onMessage: (data) => {
          gunzip(data as Buffer, (err, result) => {
            if (err) {
              throw err
            }

            const raw = result.toString()
            const response = JSON.parse(raw)

            if (response.id) {
              this.logger.log(`Interaction message: ${raw}`, 'STREAM')
              this.responses.emit(response.id.toString(), response.message)

              return
            }

            callbacks.onMessage(response)
          })
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

        if (message === 'OK') {
          resolve()
        } else {
          this.logger.error(message, method)
          reject()
        }
      })

      this.send({
        id: +id,
        method,
        params: {
          market_list: params
        }
      })
    })
  }

  subscribeOrderBook(data: SubscribeDepth[]) {
    const streams = data.map(({ symbol, level, isFull }) => {
      return [symbol, level, '0', isFull ?? false]
    })

    return this.request(streams, 'depth.subscribe')
  }

  unsubscribeOrderBook(symbols: string[]) {
    return this.request(symbols, 'depth.unsubscribe')
  }
}
