import { KuCoinFuturesMessages } from './ws/futures/messages'
import { KuCoinFuturesPublicStream } from './ws/futures/stream'
import { OrderBookEvent } from '../../types'

interface Params {
  stream: KuCoinFuturesPublicStream
}

export class KuCoinFuturesSnapshot {
  private stream: KuCoinFuturesPublicStream
  private topicName = '/contractMarket/level2Depth50:'

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update(event: KuCoinFuturesMessages.Depth50) {
    const symbol = event.topic.substring(this.topicName.length, event.topic.length)

    this.onEvent(symbol, {
      type: 'frame',
      latency: Date.now() - event.data.ts,
      bids: formatOrders(event.data.bids),
      asks: formatOrders(event.data.asks)
    })
  }

  async initialize(symbols: string[]) {
    await this.stream.subscribe('orderbook50', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol }))
    })
  }

  async stop(symbols: string[]) {
    await this.stream.unsubscribe('orderbook50', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol }))
    })
  }

  break(symbol: string) {
    this.onEvent(symbol, { type: 'offline' })
  }
}

const formatOrders = (orders: [string, number][]) => {
  return orders.map(([a, b]) => [+a, b] as [number, number])
}
