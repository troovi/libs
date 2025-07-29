import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: ({ symbol }: { symbol: string }) => {
      return `book.${symbol.toUpperCase()}.raw`
    },
    kline: ({ symbol, interval }: { symbol: string; interval: 1 | 5 }) => {
      return `chart.trades.${symbol}.${interval}`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('book')) {
      return {
        subscription: 'orderbook',
        params: { symbol: stream.split('.')[1] }
      }
    }

    if (stream.startsWith('chart.trades')) {
      const [symbol, interval] = stream.split('.').slice(2)

      return {
        subscription: 'kline',
        params: { symbol, interval: +interval as 1 | 5 }
      }
    }

    throw `invalid orangex stream: ${stream}`
  }
})
