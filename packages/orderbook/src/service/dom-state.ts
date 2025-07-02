import { OrderBookEngine } from './dom-state-engine'

export interface OrderBookUpdate {
  bids: [number, number][]
  asks: [number, number][]
}

const orders = ['bids', 'asks'] as const

const onEvent = {
  bids: 'Bid' as const,
  asks: 'Ask' as const
}

interface Options {
  priceStep: number
}

interface Change {
  side: 'bids' | 'asks'
  price: number
  quantity: number
}

// OrderBookState пригимает реальный шаг цены, даже если factor 1000.
// Так как при поиске best ордеров, пришлось бы выполнять по 1000/10000+ лишних операций обхода по пустыи индексам

export class OrderBookState extends OrderBookEngine {
  constructor({ priceStep }: Options) {
    super({ priceStep })
  }

  reset(data: OrderBookUpdate) {
    this.bids = []
    this.asks = []

    for (const side of orders) {
      for (const [price, quantity] of data[side]) {
        this[side][this.getIndex(price)] = [price, quantity]
      }
    }

    const bestBid = (() => {
      if (data.bids[0][0] > data.bids[1][0]) {
        return data.bids[0][0]
      }

      return data.bids[data.bids.length - 1][0]
    })()

    const bestAsk = (() => {
      if (data.asks[0][0] > data.asks[1][0]) {
        return data.asks[data.asks.length - 1][0]
      }

      return data.asks[0][0]
    })()

    const prevBestAsk = this.best.asks
    const prevBestBid = this.best.bids

    this.best.asks = bestAsk
    this.best.bids = bestBid

    if (prevBestAsk !== bestAsk) {
      this.onBestAskChange.emit(bestAsk)
    }

    if (prevBestBid !== bestBid) {
      this.onBestBidChange.emit(bestBid)
    }
  }

  update(data: OrderBookUpdate, onChange: (data: Change) => void = () => {}) {
    for (const side of orders) {
      let isBestChanged = false

      if (data[side].length) {
        this.searchBest(data)[side](() => {
          isBestChanged = true
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
            isBestChanged = true
          })
        }
      }

      if (isBestChanged) {
        this[`onBest${onEvent[side]}Change`].emit(this.best[side])
      }
    }
  }
}
