import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook(instId: string) {
      return { channel: 'books', instId }
    }
  },
  getStreams: (subscription: { channel: string; instId: string }) => {
    return [JSON.stringify(subscription)]
  }
})
