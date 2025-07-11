import { sleep } from '@troovi/utils-js'
import { toNumber } from '../../utils'
import { KuCoinSpotMessages } from './ws/spot/messages'
import { KuCoinSpotPublicStream } from './ws/spot/stream'
import { OrderBookEvent } from '../../types'

interface Params {
  ws: KuCoinSpotPublicStream
}

export class KuCoinSpotSnapshot {
  private ws: KuCoinSpotPublicStream

  private topicName = '/spotMarket/level2Depth50:'
  private onEvent: (event: OrderBookEvent) => void

  constructor({ ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.ws = ws
  }

  update(event: KuCoinSpotMessages.Depth50) {
    const symbol = event.topic.substring(this.topicName.length, event.topic.length)

    this.onEvent({
      type: 'snapshot',
      symbol,
      latency: Date.now() - event.data.timestamp,
      bids: toNumber(event.data.bids),
      asks: toNumber(event.data.asks)
    })
  }

  async initialize(symbols: string[]) {
    await this.ws.subscribe(({ orderbook50 }) => orderbook50(symbols))
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.onEvent({ type: 'offline', symbol })
    })

    await this.ws.unsubscribe(({ orderbook50 }) => orderbook50(symbols))
  }
}
