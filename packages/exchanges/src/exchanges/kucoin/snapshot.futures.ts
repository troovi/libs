import { KuCoinFuturesMessages } from './ws/futures/messages'
import { KuCoinFuturesPublicStream } from './ws/futures/stream'
import { OrderBookEvent } from '../../types'

interface Params {
  ws: KuCoinFuturesPublicStream
}

export class KuCoinFuturesSnapshot {
  private ws: KuCoinFuturesPublicStream
  private topicName = '/contractMarket/level2Depth50:'

  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update(event: KuCoinFuturesMessages.Depth50) {
    const symbol = event.topic.substring(this.topicName.length, event.topic.length)

    this.onEvent({
      type: 'frame',
      symbol,
      latency: Date.now() - event.data.ts,
      bids: formatOrders(event.data.bids),
      asks: formatOrders(event.data.asks)
    })
  }

  async initialize(symbols: string[]) {
    await this.ws.subscribe(({ orderbook50 }) => orderbook50(symbols))
  }

  async stop(symbols: string[]) {
    await this.ws.unsubscribe(({ orderbook50 }) => orderbook50(symbols))
  }
}

const formatOrders = (orders: [string, number][]) => {
  return orders.map(([a, b]) => [+a, b] as [number, number])
}
