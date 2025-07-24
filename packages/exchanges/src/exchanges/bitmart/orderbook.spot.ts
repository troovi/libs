import { sleep, splitByChunks } from '@troovi/utils-js'
import { BitmartSpotStream } from './ws/spot/stream'
import { BitmartSpotMessages } from './ws/spot/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  stream: BitmartSpotStream
}

export class BitmartSpotDepth {
  private logger = new Logger('bitmart dom (S)')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private stream: BitmartSpotStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update({ data }: BitmartSpotMessages.OrderBook) {
    const event = data[0]
    const source = this.store[event.symbol]

    if (event.type === 'update') {
      if (source.lastUpdateId === event.version && event.bids.length === 0 && event.asks.length === 0) {
        return
      }

      if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.version) {
        this.logger.error(`Out: ${event.symbol} ${event.version}: ${source.lastUpdateId}`, 'SYNC')

        this.onEvent(event.symbol, { type: 'offline' })
        this.stream.unsubscribe(({ orderbook }) => orderbook(event.symbol))

        source.lastUpdateId = -1

        sleep(5000).then(() => {
          this.logger.warn(`Reboot "${event.symbol}"`, 'RESTART')
          this.stream.subscribe(({ orderbook }) => orderbook(event.symbol))
        })

        return
      }
    }

    source.lastUpdateId = event.version

    this.onEvent(event.symbol, {
      type: event.type === 'update' ? 'update' : 'snapshot',
      latency: Date.now() - event.ms_t,
      bids: toNumber(event.bids),
      asks: toNumber(event.asks)
    })
  }

  async initialize(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    const chunks = splitByChunks(symbols, 20)

    for await (const subscriptions of chunks) {
      await this.stream.subscribe(({ orderbook }) => {
        return subscriptions.map((symbol) => orderbook(symbol))
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
        return subscriptions.map((symbol) => orderbook(symbol))
      })
    }
  }
}
