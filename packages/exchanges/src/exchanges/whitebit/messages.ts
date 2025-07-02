export namespace WhiteBitMessages {
  export interface depthUpdate {
    id: null
    method: 'depth_update'
    params: [
      boolean, // full_reload_flag | true - full reload, false - partial update
      {
        timestamp: number
        asks: [string, string][]
        bids: [string, string][]
      },
      string // market pair
    ]
  }
}
