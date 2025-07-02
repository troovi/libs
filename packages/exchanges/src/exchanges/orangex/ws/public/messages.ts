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
}

export type AnyOrangeXPubblicMessage = OrangeXPublicMessages.OrderBook
