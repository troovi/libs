export const Subscriptions = {
  orderbook(data: { symbol: string; level: 5 | 20 | 50; speed: '100ms' | '200ms' }) {
    return `futures/depthIncrease${data.level}:${data.symbol}@${data.speed}`
  }
}
