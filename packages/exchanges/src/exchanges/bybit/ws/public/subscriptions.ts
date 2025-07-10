import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook({ symbol, level }: { symbol: string; level: 1 | 50 | 100 }) {
      return `orderbook.${level}.${symbol.toUpperCase()}`
    }
  },
  getStreams: (streams: string | string[]) => {
    return Array.isArray(streams) ? streams : [streams]
  }
})
