import { EventBroadcaster } from '@troovi/utils-js'

export interface OrderBookUpdate {
  bids: [number, number][]
  asks: [number, number][]
}

export interface OrderBookChange {
  side: 'bids' | 'asks'
  price: number
  quantity: number
}

export abstract class OrderBookState {
  public priceStep: number

  public onBestBidChange: EventBroadcaster<number>
  public onBestAskChange: EventBroadcaster<number>

  public bids: [number, number][]
  public asks: [number, number][]

  public best: { bids: number; asks: number }

  public getIndex: (price: number) => number
  public update: (data: OrderBookUpdate, onChange?: (data: OrderBookChange) => void) => void
}
