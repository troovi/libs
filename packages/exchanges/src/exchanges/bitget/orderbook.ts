import { BitgetPublicStream } from './ws/public/stream'
import { BitgetPublicMessages } from './ws/public/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'

interface Params {
  ws: BitgetPublicStream
}

export class BitgetDepth {
  // private logger = new Logger('orderbook')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private ws: BitgetPublicStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update({ data, arg, action }: BitgetPublicMessages.OrderBook) {
    const event = data[0]
    // const source = this.store[event.symbol]

    // if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.version) {
    //   this.logger.error(`Out of sync: ${event.version}: ${source.lastUpdateId}`, 'SYNC')
    //   return
    // }

    // source.lastUpdateId = event.version

    this.onEvent({
      type: action === 'update' ? 'update' : 'snapshot',
      symbol: arg.instId,
      latency: Date.now() - +event.ts,
      bids: toNumber(event.bids),
      asks: toNumber(event.asks)
    })
  }

  async initialize(symbols: string[], instType: 'USDT-FUTURES' | 'SPOT') {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    await this.ws.subscribe(({ orderbook }) => {
      return symbols.map((instId) => orderbook({ instId, instType }))
    })
  }

  async stop(symbols: string[], instType: 'USDT-FUTURES' | 'SPOT') {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    await this.ws.unsubscribe(({ orderbook }) => {
      return symbols.map((instId) => orderbook({ instId, instType }))
    })
  }
}
