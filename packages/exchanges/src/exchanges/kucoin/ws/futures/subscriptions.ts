import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: ({ symbol }: { symbol: string }) => {
      return `/contractMarket/level2:${symbol}`
    },
    orderbook50: ({ symbol }: { symbol: string }) => {
      return `/contractMarket/level2Depth50:${symbol}`
    }
  },
  getSubscriptions: (streams: string[]) => {
    if (streams.length === 1) {
      return streams[0]
    }

    const topic = streams[0].split(':')[0]
    const symbols = streams.map((stream) => {
      return stream.split(':')[1]
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

    throw `Invalid kucoin stream: ${stream}`
  }
})
