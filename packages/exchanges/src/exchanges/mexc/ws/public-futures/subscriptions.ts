import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook(symbol: string) {
      return { method: 'depth', param: { symbol } }
    }
  },
  getStreams(streams: { method: string; param: object }) {
    return [JSON.stringify(streams)]
  }
})
