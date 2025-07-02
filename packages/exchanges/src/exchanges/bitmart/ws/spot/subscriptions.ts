export const Subscriptions = {
  orderbook: (symbol: string) => {
    return `spot/depth/increase100:${symbol}`
  }
}
