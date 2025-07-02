import { EventBroadcaster } from '@troovi/utils-js'

export interface OrderBookUpdate {
  bids: [number, number][]
  asks: [number, number][]
}

interface Options {
  priceStep: number
}

export class OrderBookEngine {
  public readonly onBestBidChange = new EventBroadcaster<number>()
  public readonly onBestAskChange = new EventBroadcaster<number>()

  private readonly priceFactor: number

  public bids: [number, number][] = []
  public asks: [number, number][] = []

  public best = {
    bids: 0,
    asks: Infinity
  }

  constructor({ priceStep }: Options) {
    this.priceFactor = Math.round(1 / priceStep)
  }

  getIndex(price: number) {
    return Math.round(price * this.priceFactor)
  }

  searchBest(data: Omit<OrderBookUpdate, 'updateId'>) {
    return {
      bids: (onChanged: () => void) => {
        if (data.bids[0][0] >= data.bids[data.bids.length - 1][0]) {
          for (let i = 0; i < data.bids.length; i++) {
            if (data.bids[i][1]) {
              const price = data.bids[i][0]

              if (price > this.best.bids) {
                this.best.bids = price
                onChanged()
              }

              break
            }
          }
        } else {
          for (let i = data.bids.length - 1; i >= 0; i--) {
            if (data.bids[i][1]) {
              const price = data.bids[i][0]

              if (price > this.best.bids) {
                this.best.bids = price
                onChanged()
              }

              break
            }
          }
        }
      },
      asks: (onChanged: () => void) => {
        if (data.asks[0][0] >= data.asks[data.asks.length - 1][0]) {
          for (let i = data.asks.length - 1; i >= 0; i--) {
            if (data.asks[i][1]) {
              const price = data.asks[i][0]

              if (price < this.best.asks) {
                this.best.asks = price
                onChanged()
              }

              break
            }
          }
        } else {
          for (let i = 0; i < data.asks.length; i++) {
            if (data.asks[i][1]) {
              const price = data.asks[i][0]

              if (price < this.best.asks) {
                this.best.asks = price
                onChanged()
              }

              break
            }
          }
        }
      }
    }
  }

  updateBest(index: number) {
    return {
      bids: (onChanged: () => void) => {
        for (let i = index - 1; i > 0; i--) {
          if (this.bids[i]) {
            this.best.bids = this.bids[i][0]
            onChanged()
            break
          }
        }
      },
      asks: (onChanged: () => void) => {
        for (let i = index + 1; i < this.asks.length; i++) {
          if (this.asks[i]) {
            this.best.asks = this.asks[i][0]
            onChanged()
            break
          }
        }
      }
    }
  }
}
