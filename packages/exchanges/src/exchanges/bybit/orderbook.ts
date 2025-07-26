import { splitByChunks } from '@troovi/utils-js'
import { ByBitStream } from './ws/public/stream'
import { StreamMessages } from './ws/public/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  stream: ByBitStream
}

// Regardless of Perpetual, Futures, Options or Spot, for one public connection, you cannot have length of "args" array over 21,000 characters.
// Spot can input up to 10 args for each subscription request sent to one connection

export class ByBitDepth {
  private logger = new Logger('bybit dom')
  private store: { [symbol: string]: { lastUpdateId: number } } = {}

  private stream: ByBitStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update(event: StreamMessages.DepthEvent) {
    const source = this.store[event.data.s]

    if (source.lastUpdateId !== -1 && source.lastUpdateId + 1 !== event.data.u) {
      this.logger.error(`spot@depth ${event.data.u}: ${source.lastUpdateId}`, 'SYNC')
      return
    }

    source.lastUpdateId = event.data.u

    this.onEvent(event.data.s, {
      type: event.type === 'delta' ? 'update' : 'snapshot',
      latency: Date.now() - event.ts,
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
      await this.stream.subscribe('orderbook', (createStream) => {
        return chunk.map((symbol) => createStream({ symbol, level: 50 }))
      })
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { lastUpdateId: -1 }
    })

    const chunks = splitByChunks(symbols, 10)

    for await (const chunk of chunks) {
      await this.stream.unsubscribe('orderbook', (createStream) => {
        return chunk.map((symbol) => createStream({ symbol, level: 50 }))
      })
    }
  }

  break(symbol: string) {
    this.store[symbol] = { lastUpdateId: -1 }
    this.onEvent(symbol, { type: 'offline' })
  }
}
