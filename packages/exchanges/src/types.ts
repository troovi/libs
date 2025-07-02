interface Event {
  type: 'snapshot' | 'update'
  symbol: string
  latency: number
  bids: [number, number][]
  asks: [number, number][]
}

interface Offline {
  type: 'offline'
  symbol: string
}

export type OrderBookEvent = Event | Offline
