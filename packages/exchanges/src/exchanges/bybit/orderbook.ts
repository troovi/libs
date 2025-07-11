import { splitByChunks } from '@troovi/utils-js'
import { ByBitStream } from './ws/public/stream'
import { StreamMessages } from './ws/public/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  ws: ByBitStream
}

// Regardless of Perpetual, Futures, Options or Spot, for one public connection, you cannot have length of "args" array over 21,000 characters.
// Spot can input up to 10 args for each subscription request sent to one connection

export class ByBitDepth {
  private logger = new Logger('bybit dom')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private ws: ByBitStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update(event: StreamMessages.DepthEvent) {
    const source = this.store[event.data.s]

    if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.data.u) {
      this.logger.error(`spot@depth ${event.data.u}: ${source.lastUpdateId}`, 'SYNC')
      return
    }

    source.lastUpdateId = event.data.u

    this.onEvent({
      type: event.type === 'delta' ? 'update' : 'snapshot',
      latency: Date.now() - event.ts,
      symbol: event.data.s,
      bids: toNumber(event.data.b as [string, string][]),
      asks: toNumber(event.data.a as [string, string][])
    })
  }

  async initialize(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    const chunks = splitByChunks(symbols, 10)

    for await (const chunk of chunks) {
      await this.ws.subscribe(({ orderbook }) => {
        return chunk.map((symbol) => orderbook({ symbol, level: 50 }))
      })
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
      this.onEvent({ type: 'offline', symbol })
    })

    const chunks = splitByChunks(symbols, 10)

    for await (const chunk of chunks) {
      await this.ws.subscribe(({ orderbook }) => {
        return chunk.map((symbol) => orderbook({ symbol, level: 50 }))
      })
    }
  }
}
