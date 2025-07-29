import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: ({ symbol, level }: { symbol: string; level: 1 | 50 | 100 }) => {
      return `orderbook.${level}.${symbol}`
    },
    kline: ({ symbol, interval }: { symbol: string; interval: 1 | 5 }) => {
      return `kline.${interval}.${symbol}`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('orderbook')) {
      const [, levelStr, symbol] = stream.split('.')
      const level = +levelStr as 1 | 50 | 100

      return { subscription: 'orderbook', params: { symbol, level } }
    }

    if (stream.startsWith('kline')) {
      const [, intervalStr, symbol] = stream.split('.')
      const interval = +intervalStr as 1 | 5

      return { subscription: 'kline', params: { symbol, interval } }
    }

    throw `invalid bybit stream: ${stream}`
  }
})
