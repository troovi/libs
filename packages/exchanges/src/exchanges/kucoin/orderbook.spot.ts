import { sleep } from '@troovi/utils-js'
import { OrderBookServer } from '../../orderbook'
import { KuCoinSpotApi } from './api/spot/api'
import { KuCoinSpotPublicStream } from './ws/spot/stream'
import { KuCoinSpotMessages } from './ws/spot/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: KuCoinSpotApi
  stream: KuCoinSpotPublicStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: KuCoinSpotMessages.OrderBook[]
}

export class KuCoinSpotDepth {
  private logger = new Logger('kucoin dom (S)')
  private store: { [symbol: string]: Store } = {}

  private api: KuCoinSpotApi
  private stream: KuCoinSpotPublicStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ api, stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.stream = stream
  }

  update(event: KuCoinSpotMessages.OrderBook) {
    const source = this.store[event.data.symbol]

    if (source.initialized) {
      if (source.lastUpdateId + 1 !== event.data.sequenceStart) {
        this.logger.error(`Out of sync: ${source.lastUpdateId}: ${event.data.sequenceStart}`, 'SYNC')
        return
      }

      this.onEvent(event.data.symbol, {
        type: 'update',
        latency: Date.now() - event.data.time,
        bids: formatOrders(event.data.changes.bids),
        asks: formatOrders(event.data.changes.asks)
      })

      source.lastUpdateId = event.data.sequenceEnd
    } else {
      source.depth.push(event)
    }
  }

  async initialize(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = {
        initialized: false,
        lastUpdateId: -1,
        depth: []
      }
    })

    await this.stream.subscribe('orderbook', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol }))
    })

    await sleep(500)

    for await (const symbol of symbols) {
      const snapshot = await this.api.getOrderBook({ symbol })

      const orderbook = new OrderBookServer()
      const source = this.store[symbol]

      orderbook.update({
        updateId: +snapshot.sequence,
        bids: snapshot.bids,
        asks: snapshot.asks
      })

      const index = source.depth.findIndex(({ data }) => {
        return data.sequenceStart >= +snapshot.sequence
      })

      if (index !== -1) {
        source.depth.slice(index).forEach(({ data: event }) => {
          event.changes.bids = event.changes.bids.filter(([, , seqId]) => +seqId > +snapshot.sequence)
          event.changes.asks = event.changes.asks.filter(([, , seqId]) => +seqId > +snapshot.sequence)

          if (event.changes.asks.length > 0 || event.changes.bids.length > 0) {
            orderbook.update({
              updateId: event.sequenceEnd,
              asks: formatOrders(event.changes.asks),
              bids: formatOrders(event.changes.bids)
            })
          }
        })
      }

      const state = orderbook.getSnapshot()

      source.depth = []
      source.initialized = true
      source.lastUpdateId = state.lastUpdateId

      this.onEvent(symbol, {
        type: 'snapshot',
        latency: Date.now() - snapshot.time,
        bids: state.bids,
        asks: state.asks
      })
    }
  }
}

const formatOrders = (orders: [string, string, string][]) => {
  return orders.map(([price, qty]) => [+price, +qty] as [number, number])
}
