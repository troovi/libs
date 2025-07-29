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

  export interface Kline {
    type: 'message'
    topic: `/contractMarket/limitCandle:${string}`
    subject: 'candle.stick'
    data: {
      symbol: string // symbol
      candles: [
        string, // Start time of the candle cycle (seconds)
        string, // open price
        string, // close price
        string, // high price
        string, // low price
        string, // Transaction volume (This value is incorrect, please do not use it, we will fix it in subsequent versions)
        string // Transaction amount
      ]
      time: number
    }
  }
}

export type AnyKuCoinFuturesMessage =
  | KuCoinFuturesMessages.Depth50
  | KuCoinFuturesMessages.OrderBook
  | KuCoinFuturesMessages.Kline
