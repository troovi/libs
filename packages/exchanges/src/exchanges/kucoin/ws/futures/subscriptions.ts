import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    // combinable
    orderbook: ({ symbol }: { symbol: string }) => {
      return `/contractMarket/level2:${symbol}`
    },
    // combinable
    orderbook50: ({ symbol }: { symbol: string }) => {
      return `/contractMarket/level2Depth50:${symbol}`
    },
    // not combinable
    kline: ({ symbol, interval }: { symbol: string; interval: '1min' | '5min' }) => {
      return `/contractMarket/limitCandle:${symbol}_${interval}`
    }
  },
  getSubscriptions: (streams: string[]) => {
    if (streams.length === 1) {
      return streams[0]
    }

    const topic = streams[0].split(':')[0]

    if (topic === 'klile') {
      throw `kucoin "${topic}" topic is not combinable: ${streams.join(',')}`
    }

    const symbols = streams.map((stream) => {
      const [_topic, symbol] = stream.split(':')

      if (_topic !== topic) {
        throw `kucoin topic: ${streams.join(',')}`
      }

      return symbol
    })

    return `${topic}:${symbols.join(',')}`
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('/contractMarket/level2Depth50:')) {
      return { subscription: 'orderbook50', params: { symbol: stream.split(':')[1] } }
    }

    if (stream.startsWith('/contractMarket/level2:')) {
      return { subscription: 'orderbook', params: { symbol: stream.split(':')[1] } }
    }

    if (stream.startsWith('/contractMarket/limitCandle:')) {
      const [symbol, interval] = stream.split(':')[1].split('_') as [string, '1min' | '5min']

      return { subscription: 'kline', params: { symbol, interval } }
    }

    throw `Invalid kucoin stream: ${stream}`
  }
})
