import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook(symbol: string) {
      return {
        channel: 'spot.order_book_update',
        payload: [symbol, '100ms'] // 100ms | 20ms
      }
    }
  },
  getStreams(streams: { channel: string; payload: object }) {
    return [JSON.stringify(streams)]
  }
})
