import { EventBroadcaster } from '@troovi/utils-js'
import { OrderBookChange, OrderBookState, OrderBookUpdate } from './orderbook'

const orders = ['bids', 'asks'] as const

// OrderBookState принимает реальный шаг цены, даже если factor 1000.
// Так как при поиске best ордеров, пришлось бы выполнять по 1000/10000+ лишних операций обхода по пустыи индексам

export class OrderBookDeltaState implements OrderBookState {
  public readonly onBestBidChange = new EventBroadcaster<number>()
  public readonly onBestAskChange = new EventBroadcaster<number>()

  public readonly priceFactor: number
  public readonly priceStep: number

  public bids: [number, number][] = []
  public asks: [number, number][] = []

  public best = {
    bids: 0,
    asks: Infinity
  }

  constructor({ priceStep }: { priceStep: number }) {
    this.priceFactor = Math.round(1 / priceStep)
    this.priceStep = priceStep
  }

  getIndex(price: number) {
    return Math.round(price * this.priceFactor)
  }

  update(data: OrderBookUpdate, onChange: (data: OrderBookChange) => void = () => {}) {
    const isBestChanged = { bids: false, asks: false }

    for (const side of orders) {
      if (data[side].length) {
        this.searchBest(data)[side](() => {
          isBestChanged[side] = true
        })
      }

      let isRemoved = false

      for (const [price, quantity] of data[side]) {
        const index = this.getIndex(price)

        if (quantity) {
          this[side][index] = [price, quantity]
        } else {
          delete this[side][index]
          isRemoved = true
        }

        onChange({ side, price, quantity })
      }

      if (isRemoved) {
        const index = this.getIndex(this.best[side])

        if (!this[side][index]) {
          this.updateBest(index)[side](() => {
            isBestChanged[side] = true
          })
        }
      }
    }

    if (isBestChanged.asks) {
      this.onBestAskChange.emit(this.best.asks)
    }

    if (isBestChanged.bids) {
      this.onBestBidChange.emit(this.best.bids)
    }
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
