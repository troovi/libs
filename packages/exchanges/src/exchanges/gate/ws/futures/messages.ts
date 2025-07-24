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
}
