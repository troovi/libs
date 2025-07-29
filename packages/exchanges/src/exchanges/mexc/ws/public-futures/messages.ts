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

  export interface Kline {
    ts: number
    channel: 'push.kline'
    symbol: string
    data: {
      a: number
      c: number
      h: number
      l: number
      o: number
      q: number
      t: number
      interval: 'Min1' | 'Min5'
      symbol: string
    }
  }
}
