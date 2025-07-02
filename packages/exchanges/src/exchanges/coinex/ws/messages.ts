export namespace CoinExMessages {
  export interface Depth {
    id: null
    method: 'depth.update'
    data: {
      market: string
      is_full: boolean
      depth: {
        asks?: [string, string][]
        bids?: [string, string][]
        last: string
        updated_at: number
        checksum: number
      }
    }
  }
}
