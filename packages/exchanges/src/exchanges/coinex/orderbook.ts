import { CoinExStream } from './ws/stream'
import { CoinExMessages } from './ws/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'

interface Params {
  stream: CoinExStream
}

export class CoinExDepth {
  private stream: CoinExStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update({ data }: CoinExMessages.Depth) {
    // при нестабильном подключении возможен повторный snapshot
    this.onEvent(data.market, {
      type: data.is_full ? 'snapshot' : 'update',
      latency: Date.now() - data.depth.updated_at,
      bids: toNumber(data.depth.bids),
      asks: toNumber(data.depth.asks)
    })
  }

  async initialize(symbols: string[]) {
    await this.stream.subscribe('orderbook', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol, level: 50 }))
    })
  }

  async stop(symbols: string[]) {
    await this.stream.unsubscribe('orderbook', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol, level: 50 }))
    })
  }

  break(symbol: string) {
    this.onEvent(symbol, { type: 'offline' })
  }
}
