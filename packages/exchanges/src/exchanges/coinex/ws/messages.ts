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

  export interface State {
    method: 'state.update'
    data: {
      state_list: {
        // day metrics:
        market: string
        last: string
        open: string
        close: string
        high: string
        low: string
        volume: string
        value: string
        volume_sell: string
        volume_buy: string
        period: 86400
      }[]
    }
    id: null
  }
}
