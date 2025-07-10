import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook(data: { symbol: string; level: 5 | 20 | 50; speed: '100ms' | '200ms' }) {
      return `futures/depthIncrease${data.level}:${data.symbol}@${data.speed}`
    }
  },
  getStreams: (streams: string | string[]) => {
    return Array.isArray(streams) ? streams : [streams]
  }
})
