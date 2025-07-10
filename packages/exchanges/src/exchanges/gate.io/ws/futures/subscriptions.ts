import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook(data: { symbol: string; speed: '100ms' | '20ms'; level: '100' | '50' | '20' }) {
      return {
        channel: 'futures.order_book_update',
        payload: [data.symbol, data.speed, data.level]
      }
    }
  },
  getStreams: (streams: { channel: string; payload: object }) => {
    return [JSON.stringify(streams)]
  }
})
