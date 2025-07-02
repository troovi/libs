export namespace MexcFuturesMessages {
  export interface Depth {
    ts: number
    channel: 'push.depth'
    symbol: string
    data: {
      asks: [number, number, number][]
      bids: [number, number, number][]
      end: number
      begin: number
      version: number
    }
  }
}
