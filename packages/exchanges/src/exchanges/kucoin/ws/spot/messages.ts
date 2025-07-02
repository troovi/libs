export namespace KuCoinSpotMessages {
  export interface OrderBook {
    topic: `/market/level2:${string}`
    type: 'message'
    subject: 'trade.l2update'
    data: {
      changes: {
        asks: [string, string, string][]
        bids: [string, string, string][]
      }
      sequenceEnd: number
      sequenceStart: number
      symbol: string
      time: number
    }
  }

  export interface Depth50 {
    type: 'message'
    topic: `/spotMarket/level2Depth50:${string}`
    subject: 'level2'
    data: {
      asks: [string, string][]
      bids: [string, string][]
      timestamp: number
    }
  }
}

export type AnyKuCoinSpotMessage = KuCoinSpotMessages.Depth50 | KuCoinSpotMessages.OrderBook
