import { Subscriptions } from '../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook: (items: { symbol: string; level: 5 | 10 | 20 | 50; isFull?: boolean }[]) => {
      return {
        method: 'depth',
        subscriptions: items.map(({ symbol, level, isFull }) => {
          return [symbol, level, '0', isFull ?? false]
        })
      }
    }
  },
  getStreams: (streams: { method: string; subscriptions: object[] }) => {
    return streams.subscriptions.map((item) => {
      return `${streams.method}:${JSON.stringify(item)}`
    })
  }
})
