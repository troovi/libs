export namespace GateFuturesMessages {
  export interface OrderBookUpdate {
    time: number
    time_ms: number
    channel: 'futures.order_book_update'
    event: 'update'
    result: {
      t: number
      U: number
      u: number
      s: string
      a: { p: string; s: number }[]
      b: { p: string; s: number }[]
      l: '100' | '50' | '20'
    }
  }

  export interface Candlestick {
    time: number
    time_ms: number
    channel: 'futures.candlesticks'
    event: 'update'
    result: {
      t: number // seconds
      v: number // volume
      c: string // close
      h: string // high
      l: string // low
      o: string // open
      n: string // '1m_BTC_USD'
      a: string // amount (quote volume)
    }[]
  }
}
