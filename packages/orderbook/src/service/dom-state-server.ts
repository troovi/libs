import { OrderBookEngine } from './dom-state-engine'

export interface OrderBookUpdate {
  updateId: number
  bids: [number, number][]
  asks: [number, number][]
}

interface ValuesIndexes {
  bids: { [index: number]: true }
  asks: { [index: number]: true }
}

const orders = ['bids', 'asks'] as const

const onEvent = {
  bids: 'Bid' as const,
  asks: 'Ask' as const
}

interface Options {
  priceStep: number
}

export class OrderBookServerState extends OrderBookEngine {
  private readonly valuesIndexes: ValuesIndexes = { bids: {}, asks: {} }
  public updateId = -1

  constructor({ priceStep }: Options) {
    super({ priceStep })
  }

  getSnapshot() {
    const bids: [number, number][] = []
    const asks: [number, number][] = []

    for (const bidIndex in this.valuesIndexes.bids) {
      bids.push(this.bids[+bidIndex])
    }

    for (const askIndex in this.valuesIndexes.asks) {
      asks.push(this.asks[+askIndex])
    }

    return {
      lastUpdateId: this.updateId,
      bids: bids.sort((a, b) => b[0] - a[0]),
      asks: asks.sort((a, b) => a[0] - b[0])
    }
  }

  update(data: OrderBookUpdate) {
    this.updateId = data.updateId

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
          this.valuesIndexes[side][index] = true
        } else {
          delete this[side][index]
          delete this.valuesIndexes[side][index]

          isRemoved = true
        }
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
