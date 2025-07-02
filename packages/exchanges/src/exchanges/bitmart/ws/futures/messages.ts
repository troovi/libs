export namespace BitMartFuturesMessages {
  export interface OrderBook {
    group: `futures/depthIncrease${string}`
    data: {
      symbol: string
      asks: { price: string; vol: string }[]
      bids: { price: string; vol: string }[]
      ms_t: number
      version: number
      type: 'update' | 'snapshot'
    }
  }
}
