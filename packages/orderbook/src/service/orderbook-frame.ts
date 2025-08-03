import { EventBroadcaster } from '@troovi/utils-js'
import { OrderBookChange, OrderBookState, OrderBookUpdate } from './orderbook'

const orders = ['bids', 'asks'] as const

const math = {
  bids: 'max' as const,
  asks: 'min' as const
}

export class OrderBookFrameState implements OrderBookState {
  public readonly onBestBidChange = new EventBroadcaster<number>()
  public readonly onBestAskChange = new EventBroadcaster<number>()

  public readonly priceStep: number
  public readonly priceFactor: number

  private current = {
    bids: {} as { [price: number]: true },
    asks: {} as { [price: number]: true }
  }

  public bids: [number, number][] = []
  public asks: [number, number][] = []

  public best = {
    bids: 0,
    asks: Infinity
  }

  constructor({ priceStep }: { priceStep: number }) {
    this.priceStep = priceStep
    this.priceFactor = Math.round(1 / priceStep)
  }

  getIndex(price: number) {
    return Math.round(price * this.priceFactor)
  }

  update(data: OrderBookUpdate, onChange: (data: OrderBookChange) => void = () => {}) {
    const isBestChanged = { bids: false, asks: false }

    for (const side of orders) {
      const nextCurrent: { [price: number]: true } = {}

      const best = Math[math[side]](data[side][0][0], data[side][data[side].length - 1][0])

      if (this.best[side] !== best) {
        this.best[side] = best
        isBestChanged[side] = true
      }

      for (const [price, quantity] of data[side]) {
        const index = this.getIndex(price)

        delete this.current[side][price]
        nextCurrent[price] = true

        if (quantity) {
          this[side][index] = [price, quantity]
        } else {
          delete this[side][index]
        }

        onChange({ side, price, quantity })
      }

      for (const price in this.current[side]) {
        delete this[side][this.getIndex(+price)]
        onChange({ side, price: +price, quantity: 0 })
      }

      this.current[side] = nextCurrent
    }

    if (isBestChanged.asks) {
      this.onBestAskChange.emit(this.best.asks)
    }

    if (isBestChanged.bids) {
      this.onBestBidChange.emit(this.best.bids)
    }
  }
}
