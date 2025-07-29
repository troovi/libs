export namespace BitmartSpotMessages {
  export interface OrderBook {
    table: 'spot/depth/increase100'
    data: [
      {
        asks: [string, string][]
        bids: [string, string][]
        ms_t: number
        symbol: string
        type: 'snapshot' | 'update'
        version: number
      }
    ]
  }

  export interface Kline {
    table: 'spot/kline1m'
    data: [
      {
        candle: [
          number, // timestamp (seconds)
          string, // open
          string, // high
          string, // low
          string, // close
          string // volume
        ]
        symbol: string
      }
    ]
  }
}
