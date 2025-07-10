import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook: (data: { instType: 'USDT-FUTURES' | 'SPOT'; instId: string }) => {
      return {
        instType: data.instType,
        channel: 'books',
        instId: data.instId
      }
    }
  },
  getStreams(stream: Record<string, unknown> | Record<string, unknown>[]) {
    return Array.isArray(stream) ? stream.map((u) => JSON.stringify(u)) : [JSON.stringify(stream)]
  }
})
