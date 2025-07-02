export interface Track {
  [tick: string]: {
    status: 'free' | 'bids' | 'asks' | 'both'
    bidsVolume: number
    asksVolume: number
    bids: {
      [price: string]: number
    }
    asks: {
      [price: string]: number
    }
  }
}

export const orders = ['bids', 'asks'] as const
