import { toNumber } from '../../utils'
import { KuCoinSpotMessages } from './ws/spot/messages'
import { KuCoinSpotPublicStream } from './ws/spot/stream'
import { OrderBookEvent } from '../../types'

interface Params {
  stream: KuCoinSpotPublicStream
}

export class KuCoinSpotSnapshot {
  private stream: KuCoinSpotPublicStream

  private topicName = '/spotMarket/level2Depth50:'
  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update(event: KuCoinSpotMessages.Depth50) {
    const symbol = event.topic.substring(this.topicName.length, event.topic.length)

    this.onEvent(symbol, {
      type: 'frame',
      latency: Date.now() - event.data.timestamp,
      bids: toNumber(event.data.bids),
      asks: toNumber(event.data.asks)
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
