import { sleep, splitByChunks } from '@troovi/utils-js'
import { BitmartFuturesStream } from './ws/futures/stream'
import { BitmartFuturesMessages } from './ws/futures/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  stream: BitmartFuturesStream
}

export class BitmartFuturesDepth {
  private logger = new Logger('bitmart-dom (F)')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private stream: BitmartFuturesStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update({ data: event }: BitmartFuturesMessages.OrderBook) {
    const source = this.store[event.symbol]

    if (event.type !== 'snapshot') {
      if (source.lastUpdateId === event.version && event.bids.length === 0 && event.asks.length === 0) {
        console.log('PAASS')
        return
      }

      if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.version) {
        this.logger.error(`Out: ${event.symbol} ${event.version}: ${source.lastUpdateId}`, 'SYNC')

        this.onEvent(event.symbol, { type: 'offline' })

        this.stream.unsubscribe(({ orderbook }) => {
          return orderbook({ symbol: event.symbol, level: 50, speed: '200ms' })
        })

        source.lastUpdateId = -1

        sleep(5000).then(() => {
          this.logger.warn(`Reboot "${event.symbol}"`, 'RESTART')
          this.stream.subscribe(({ orderbook }) => {
            return orderbook({ symbol: event.symbol, level: 50, speed: '200ms' })
          })
        })

        return
      }
    }
    source.lastUpdateId = event.version

    this.onEvent(event.symbol, {
      type: event.type === 'update' ? 'update' : 'snapshot',
      latency: Date.now() - event.ms_t,
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
      await this.stream.subscribe(({ orderbook }) => {
        return subscriptions.map((symbol) => orderbook({ symbol, level: 50, speed: '200ms' }))
      })
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    const chunks = splitByChunks(symbols, 20)

    for await (const subscriptions of chunks) {
      await this.stream.unsubscribe(({ orderbook }) => {
        return subscriptions.map((symbol) => orderbook({ symbol, level: 50, speed: '200ms' }))
      })
    }
  }
}

const formatOrder = (orders: { price: string; vol: string }[]) => {
  return orders.map(({ price, vol }) => [+price, +vol] as [number, number])
}
