export namespace BitmartFuturesMessages {
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

  export interface Kline {
    group: `futures/klineBin${'1m' | '5m'}:${string}`
    data: {
      symbol: string
      o: string
      h: string
      l: string
      c: string
      v: string
      ts: number // seconds
    }
  }
}
