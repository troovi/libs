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

  export interface Candle {
    ts: number
    action: 'update' | 'snapshot'
    arg: {
      instType: 'SPOT' | 'USDT-FUTURES'
      channel: `candle${'1m' | '5m'}`
      instId: string
    }
    data: [
      string, // timestamp
      string, // open
      string, // high
      string, // low
      string, // close
      string, // volume
      string // quoteVolume
    ][]
  }
}
