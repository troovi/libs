export const Topics = {
  orderbook: (symbols: string[]) => {
    return `/market/level2:${symbols.join(',')}`
  },
  orderbook50: (symbol: string) => {
    return `/spotMarket/level2Depth50:${symbol}`
  }
}
