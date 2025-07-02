export const Topics = {
  orderbook: (symbol: string) => {
    return `/contractMarket/level2:${symbol}`
  },
  orderbook50: (symbol: string) => {
    return `/contractMarket/level2Depth50:${symbol}`
  }
}
