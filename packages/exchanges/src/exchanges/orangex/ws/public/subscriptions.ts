import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: ({ symbol }: { symbol: string }) => {
      return `book.${symbol.toUpperCase()}.raw`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('book')) {
      return { subscription: 'orderbook', params: { symbol: stream.split('.')[1] } }
    }

    throw `invalid orangex stream: ${stream}`
  }
})
