import { sleep } from '@troovi/utils-js'
import { OKXPublicStream } from './ws/public/stream'
import { OKXMessages } from './ws/public/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  stream: OKXPublicStream
}

export class OKXDepth {
  private logger = new Logger('okx dom')
  private store: { [symbol: string]: { seqId: number } } = {}

  private stream: OKXPublicStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update(event: OKXMessages.Books) {
    const source = this.store[event.arg.instId]
    const data = event.data[0]

    if (source.seqId !== -1 && source.seqId !== data.prevSeqId) {
      this.logger.error(`Out: ${source.seqId} ${data.prevSeqId}`, 'SYNC')
      this.onEvent(event.arg.instId, { type: 'offline' })
      return
    }

    source.seqId = data.seqId

    this.onEvent(event.arg.instId, {
      type: event.action === 'update' ? 'update' : 'snapshot',
      latency: Date.now() - +data.ts,
      asks: formatOrders(data.asks),
      bids: formatOrders(data.bids)
    })
  }

  async initialize(instIds: string[]) {
    for await (const instId of instIds) {
      this.store[instId] = { seqId: -1 }
      await this.stream.subscribe('orderbook', (createStream) => createStream(instId))
      await sleep(250)
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { seqId: -1 }
    })

    for await (const symbol of symbols) {
      await this.stream.unsubscribe('orderbook', (createStream) => createStream(symbol))
    }
  }

  break(symbol: string) {
    this.store[symbol] = { seqId: -1 }
    this.onEvent(symbol, { type: 'offline' })
  }
}

const formatOrders = (orders: [string, string, string, string][]) => {
  return orders.map(([price, qty]) => [+price, +qty] as [number, number])
}
