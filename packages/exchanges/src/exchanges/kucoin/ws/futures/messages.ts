export namespace KuCoinFuturesMessages {
  export interface OrderBook {
    type: 'message'
    topic: `/contractMarket/level2:${string}`
    subject: 'level2'
    data: {
      sequence: number //Sequence number which is used to judge the continuity of pushed messages
      change: string // ('5000.0,sell,83') Price, side, quantity
      timestamp: number
    }
  }

  export interface Depth50 {
    type: 'message'
    topic: `/contractMarket/level2Depth50:${string}`
    subject: 'level2'
    data: {
      asks: [string, number][]
      bids: [string, number][]
      ts: number
    }
  }
}

export type AnyKuCoinFuturesMessage = KuCoinFuturesMessages.Depth50 | KuCoinFuturesMessages.OrderBook
