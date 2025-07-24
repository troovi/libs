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
}
