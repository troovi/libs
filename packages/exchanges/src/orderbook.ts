interface Event {
  updateId: number
  bids: (string | number)[][]
  asks: (string | number)[][]
}

interface OrderBookState {
  bids: Record<string, number>
  asks: Record<string, number>
}

export class OrderBookCache {
  private lastUpdateId: number
  private state: OrderBookState

  constructor() {
    this.state = {
      bids: {},
      asks: {}
    }
  }

  getState() {
    const bids = []
    const asks = []

    for (const bid in this.state.bids) {
      bids.push([+bid, this.state.bids[bid]])
    }

    for (const ask in this.state.asks) {
      asks.push([+ask, this.state.asks[ask]])
    }

    return {
      lastUpdateId: this.lastUpdateId,
      bids: bids.sort((a, b) => b[0] - a[0]) as [number, number][],
      asks: asks.sort((a, b) => a[0] - b[0]) as [number, number][]
    }
  }

  update(event: Event) {
    this.lastUpdateId = event.updateId

    for (const order of ['bids', 'asks'] as const) {
      for (const [price, volume] of event[order]) {
        if (+volume === 0) {
          delete this.state[order][price]
        } else {
          this.state[order][price] = +volume
        }
      }
    }
  }
}
