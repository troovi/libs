import { sleep } from '@troovi/utils-js'
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
      type: 'snapshot',
      symbol,
      latency: Date.now() - event.data.ts,
      bids: formatOrders(event.data.bids),
      asks: formatOrders(event.data.asks)
    })
  }

  stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.onEvent({ type: 'offline', symbol })
    })
  }

  async initialize(symbols: string[]) {
    for await (const symbol of symbols) {
      await this.ws.subscribe(({ orderbook50 }) => orderbook50(symbol))
      await sleep(250)
    }
  }
}

const formatOrders = (orders: [string, number][]) => {
  return orders.map(([a, b]) => [+a, b] as [number, number])
}
