import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook: (symbol: string) => {
      return `spot/depth/increase100:${symbol}`
    }
  },
  getStreams: (streams: string | string[]) => {
    return Array.isArray(streams) ? streams : [streams]
  }
})
