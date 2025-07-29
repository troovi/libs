import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    orderbook: (symbol: string) => {
      return JSON.stringify({ method: 'depth', param: { symbol } })
    },
    kline: ({ symbol, interval }: { symbol: string; interval: 'Min1' | 'Min5' }) => {
      return JSON.stringify({ method: 'kline', param: { symbol, interval } })
    }
  },
  getSubscriptions: ([stream]) => {
    return JSON.parse(stream) as { method: string; param: object }
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as { method: string; param: any }

    if (data.method === 'depth') {
      return { subscription: 'orderbook', params: data.param.symbol }
    }

    throw `invalid mexc stream: ${stream}`
  }
})
