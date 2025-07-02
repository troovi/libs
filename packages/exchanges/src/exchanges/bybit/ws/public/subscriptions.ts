export const Subscriptions = {
  orderbook({ symbol, level }: { symbol: string; level: 1 | 50 | 100 }) {
    return `orderbook.${level}.${symbol.toUpperCase()}`
  }
}
