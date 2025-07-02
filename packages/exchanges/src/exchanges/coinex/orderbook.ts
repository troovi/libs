import { CoinExStream } from './ws/stream'
import { CoinExMessages } from './ws/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'

interface Params {
  ws: CoinExStream
}

export class CoinExDepth {
  private ws: CoinExStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update({ data }: CoinExMessages.Depth) {
    // при нестабильном подключении возможен повторный snapshot
    this.onEvent({
      type: data.is_full ? 'snapshot' : 'update',
      latency: Date.now() - data.depth.updated_at,
      symbol: data.market,
      bids: toNumber(data.depth.bids),
      asks: toNumber(data.depth.asks)
    })
  }

  async initialize(symbols: string[]) {
    await this.ws.subscribeOrderBook(symbols.map((symbol) => ({ symbol, level: 50 })))
  }

  stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.onEvent({ type: 'offline', symbol })
    })
  }
}
