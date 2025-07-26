import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: ({ symbol, level }: { symbol: string; level: 1 | 50 | 100 }) => {
      return `orderbook.${level}.${symbol.toUpperCase()}`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('orderbook')) {
      const [, levelStr, symbol] = stream.split('.')
      const level = +levelStr as 1 | 50 | 100

      if (level !== 1 && level !== 50 && level !== 100) {
        throw `Invalid: ${stream}`
      }

      return { subscription: 'orderbook', params: { symbol, level } }
    }

    throw `invalid bybit stream: ${stream}`
  }
})
