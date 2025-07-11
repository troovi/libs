import { sleep } from '@troovi/utils-js'
import { OKXPublicStream } from './ws/public/stream'
import { OKXMessages } from './ws/public/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  ws: OKXPublicStream
}

export class OKXDepth {
  private logger = new Logger('okx dom')
  private store: { [symbol: string]: { seqId: number } } = {}

  private ws: OKXPublicStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update(event: OKXMessages.Books) {
    const source = this.store[event.arg.instId]
    const data = event.data[0]

    if (source.seqId !== -1 && source.seqId !== data.prevSeqId) {
      this.logger.error(`Out: ${source.seqId} ${data.prevSeqId}`, 'SYNC')
      return
    }

    source.seqId = data.seqId

    this.onEvent({
      type: event.action === 'update' ? 'update' : 'snapshot',
      symbol: event.arg.instId,
      latency: Date.now() - +data.ts,
      asks: formatOrders(data.asks),
      bids: formatOrders(data.bids)
    })
  }

  async initialize(instIds: string[]) {
    for await (const instId of instIds) {
      this.store[instId] = { seqId: -1 }
      await this.ws.subscribe(({ orderbook }) => orderbook(instId))
      await sleep(250)
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = { seqId: -1 }
      this.onEvent({ type: 'offline', symbol })
    })

    for await (const symbol of symbols) {
      await this.ws.subscribe(({ orderbook }) => orderbook(symbol))
    }
  }
}

const formatOrders = (orders: [string, string, string, string][]) => {
  return orders.map(([price, qty]) => [+price, +qty] as [number, number])
}
