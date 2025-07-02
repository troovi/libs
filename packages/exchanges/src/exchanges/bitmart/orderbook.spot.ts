import { sleep, splitByChunks } from '@troovi/utils-js'
import { BitMartSpotStream } from './ws/spot/stream'
import { BitMartSpotMessages } from './ws/spot/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  ws: BitMartSpotStream
}

export class BitMartSpotDepth {
  private logger = new Logger('bitmart dom (S)')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private ws: BitMartSpotStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update({ data }: BitMartSpotMessages.OrderBook) {
    const event = data[0]
    const source = this.store[event.symbol]

    if (event.type !== 'snapshot') {
      if (source.lastUpdateId === event.version && event.bids.length === 0 && event.asks.length === 0) {
        return
      }

      if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.version) {
        this.logger.error(`Out: ${event.symbol} ${event.version}: ${source.lastUpdateId}`, 'SYNC')

        this.onEvent({ type: 'offline', symbol: event.symbol })
        this.ws.unsubscribe(({ orderbook }) => orderbook(event.symbol))

        source.lastUpdateId = -1

        sleep(5000).then(() => {
          this.logger.warn(`Reboot "${event.symbol}"`, 'RESTART')
          this.ws.subscribe(({ orderbook }) => orderbook(event.symbol))
        })

        return
      }
    }

    source.lastUpdateId = event.version

    this.onEvent({
      type: event.type === 'update' ? 'update' : 'snapshot',
      latency: Date.now() - event.ms_t,
      symbol: event.symbol,
      bids: toNumber(event.bids),
      asks: toNumber(event.asks)
    })
  }

  async initialize(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    const subscription = splitByChunks(symbols, 20)

    for await (const subscriptions of subscription) {
      this.ws.subscribe(({ orderbook }) => {
        return subscriptions.map((symbol) => orderbook(symbol))
      })

      await sleep(2000)
    }
  }

  stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }

      this.onEvent({ type: 'offline', symbol })
    })
  }
}
