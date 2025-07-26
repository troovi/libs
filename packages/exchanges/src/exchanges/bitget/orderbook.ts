import { BitgetPublicStream } from './ws/public/stream'
import { BitgetPublicMessages } from './ws/public/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'

interface Params {
  stream: BitgetPublicStream
}

export class BitgetDepth {
  // private logger = new Logger('orderbook')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private stream: BitgetPublicStream

  private onEvent: (symbol: string, market: 'spot' | 'futures', event: OrderBookEvent) => void

  constructor(
    { stream }: Params,
    onEvent: (symbol: string, market: 'spot' | 'futures', event: OrderBookEvent) => void
  ) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update({ data, arg, action }: BitgetPublicMessages.OrderBook) {
    const event = data[0]

    // if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.version) {
    //   this.logger.error(`Out of sync: ${event.version}: ${source.lastUpdateId}`, 'SYNC')
    //   return
    // }

    // source.lastUpdateId = event.version

    this.onEvent(arg.instId, arg.instType === 'SPOT' ? 'spot' : 'futures', {
      type: action === 'update' ? 'update' : 'snapshot',
      latency: Date.now() - +event.ts,
      bids: toNumber(event.bids),
      asks: toNumber(event.asks)
    })
  }

  async initialize(symbols: string[], instType: 'USDT-FUTURES' | 'SPOT') {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    await this.stream.subscribe('orderbook', (createStream) => {
      return symbols.map((instId) => createStream({ instId, instType }))
    })
  }

  async stop(symbols: string[], instType: 'USDT-FUTURES' | 'SPOT') {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    await this.stream.unsubscribe('orderbook', (createStream) => {
      return symbols.map((instId) => createStream({ instId, instType }))
    })
  }

  break(symbol: string, instType: 'USDT-FUTURES' | 'SPOT') {
    this.store[symbol].lastUpdateId = -1
    this.onEvent(symbol, instType === 'SPOT' ? 'spot' : 'futures', { type: 'offline' })
  }
}
