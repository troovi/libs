export const Subscriptions = {
  orderbook({ symbol }: { symbol: string }) {
    return `book.${symbol.toUpperCase()}.raw`
  }
}
