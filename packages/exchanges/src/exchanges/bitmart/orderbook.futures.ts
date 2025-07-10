import { sleep, splitByChunks } from '@troovi/utils-js'
import { BitMartFuturesStream } from './ws/futures/stream'
import { BitMartFuturesMessages } from './ws/futures/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  ws: BitMartFuturesStream
}

export class BitMartFuturesDepth {
  private logger = new Logger('bitmart-dom (F)')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private ws: BitMartFuturesStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update({ data: event }: BitMartFuturesMessages.OrderBook) {
    const source = this.store[event.symbol]

    if (event.type !== 'snapshot') {
      if (source.lastUpdateId === event.version && event.bids.length === 0 && event.asks.length === 0) {
        console.log('PAASS')
        return
      }

      if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.version) {
        this.logger.error(`Out: ${event.symbol} ${event.version}: ${source.lastUpdateId}`, 'SYNC')

        this.onEvent({ type: 'offline', symbol: event.symbol })

        this.ws.unsubscribe(({ orderbook }) => {
          return orderbook({ symbol: event.symbol, level: 50, speed: '200ms' })
        })

        source.lastUpdateId = -1

        sleep(5000).then(() => {
          this.logger.warn(`Reboot "${event.symbol}"`, 'RESTART')
          this.ws.subscribe(({ orderbook }) => {
            return orderbook({ symbol: event.symbol, level: 50, speed: '200ms' })
          })
        })

        return
      }
    }
    source.lastUpdateId = event.version

    this.onEvent({
      type: event.type === 'update' ? 'update' : 'snapshot',
      latency: Date.now() - event.ms_t,
      symbol: event.symbol,
      bids: formatOrder(event.bids),
      asks: formatOrder(event.asks)
    })
  }

  async initialize(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    const chunks = splitByChunks(symbols, 20)

    for await (const subscriptions of chunks) {
      await this.ws.subscribe(({ orderbook }) => {
        return subscriptions.map((symbol) => orderbook({ symbol, level: 50, speed: '200ms' }))
      })
    }
  }

  stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }

      this.onEvent({ type: 'offline', symbol })
    })
  }
}

const formatOrder = (orders: { price: string; vol: string }[]) => {
  return orders.map(({ price, vol }) => [+price, +vol] as [number, number])
}
