export namespace BitgetPublicMessages {
  export interface OrderBook {
    ts: number
    action: 'update' | 'snapshot'
    arg: {
      instType: 'SPOT' | 'USDT-FUTURES'
      channel: 'books'
      instId: string
    }
    data: [
      {
        asks: [string, string][]
        bids: [string, string][]
        checksum: number
        seq: number
        ts: string
      }
    ]
  }
}
