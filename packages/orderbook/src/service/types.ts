export const orders = ['bids', 'asks'] as const

export interface TickData {
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
