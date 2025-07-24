import { sleep } from '@troovi/utils-js'
import { OrderBookServer } from '../../orderbook'
import { KuCoinFuturesApi } from './api/futures/api'
import { KuCoinFuturesPublicStream } from './ws/futures/stream'
import { KuCoinFuturesMessages } from './ws/futures/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: KuCoinFuturesApi
  stream: KuCoinFuturesPublicStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: KuCoinFuturesMessages.OrderBook[]
}

export class KuCoinFuturesDepth {
  private logger = new Logger('kucoin dom (F)')
  private store: { [symbol: string]: Store } = {}

  private api: KuCoinFuturesApi
  private stream: KuCoinFuturesPublicStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ api, stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.stream = stream
  }

  update(event: KuCoinFuturesMessages.OrderBook) {
    const symbol = event.topic.split(':')[1]
    const source = this.store[symbol]

    if (source.initialized) {
      if (source.lastUpdateId + 1 !== event.data.sequence) {
        this.logger.error(`Out of sync: ${source.lastUpdateId}: ${event.data.sequence}`, 'SYNC')
        return
      }

      this.onEvent(symbol, {
        type: 'update',
        latency: Date.now() - event.data.timestamp,
        ...getOrders(event.data.change)
      })

      source.lastUpdateId = event.data.sequence
    } else {
      source.depth.push(event)
    }
  }

  async initialize(symbol: string) {
    this.store[symbol] = {
      initialized: false,
      lastUpdateId: -1,
      depth: []
    }

    await this.stream.subscribe(({ orderbook }) => orderbook([symbol]))
    await sleep(500)

    const snapshot = await this.api.getOrderBook({ symbol })

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: +snapshot.sequence,
      bids: snapshot.bids,
      asks: snapshot.asks
    })

    const index = source.depth.findIndex(({ data }) => {
      return data.sequence > +snapshot.sequence
    })

    if (index !== -1) {
      source.depth.slice(index).forEach(({ data: event }) => {
        orderbook.update({
          updateId: event.sequence,
          ...getOrders(event.change)
        })
      })
    }

    const state = orderbook.getSnapshot()

    source.depth = []
    source.initialized = true
    source.lastUpdateId = state.lastUpdateId

    this.onEvent(symbol, {
      type: 'snapshot',
      latency: Date.now() - snapshot.ts,
      bids: state.bids,
      asks: state.asks
    })
  }
}

const getOrders = (change: string) => {
  const [price, side, quantity] = change.split(',')

  return {
    asks: side === 'sell' ? [[+price, +quantity] as [number, number]] : [],
    bids: side === 'buy' ? [[+price, +quantity] as [number, number]] : []
  }
}
