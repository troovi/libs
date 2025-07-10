import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook({ symbol }: { symbol: string }) {
      return `book.${symbol.toUpperCase()}.raw`
    }
  },
  getStreams: (streams: string | string[]) => {
    return Array.isArray(streams) ? streams : [streams]
  }
})
