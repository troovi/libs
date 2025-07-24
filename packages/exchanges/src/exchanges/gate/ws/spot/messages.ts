export namespace GateSpotMessages {
  export interface OrderBookUpdate {
    time: number
    time_ms: number
    channel: 'spot.order_book_update'
    event: 'update'
    result: {
      t: number
      l: '100'
      e: 'depthUpdate'
      E: number
      s: string
      U: number
      u: number
      b: [string, string][]
      a: [string, string][]
    }
  }
}
