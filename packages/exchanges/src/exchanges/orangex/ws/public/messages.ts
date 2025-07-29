export namespace OrangeXPublicMessages {
  export interface OrderBook {
    channel: `book.${string}.raw`
    data: {
      timestamp: number
      change_id: number
      bids: ['new' | 'delete', string, string][]
      asks: ['new' | 'delete', string, string][]
      instrument_name: string
    }
  }

  export interface Kline {
    channel: `chart.trades.${string}.${1 | 5}`
    data: {
      tick: string
      open: string
      high: string
      low: string
      close: string
      volume: string
      cost: string
    }
  }
}

export type AnyOrangeXPubblicMessage = OrangeXPublicMessages.OrderBook | OrangeXPublicMessages.Kline
