import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    diffBookDepth: ({ symbol, speed }: { symbol: string; speed: 100 | 10 }) => {
      return `spot@public.aggre.depth.v3.api.pb@${speed}ms@${symbol.toUpperCase()}`
    },
    trades: ({ symbol, speed }: { symbol: string; speed: 100 | 10 }) => {
      return `spot@public.aggre.deals.v3.api.pb@${speed}ms@${symbol.toUpperCase()}`
    },
    kline: ({ symbol, interval }: { symbol: string; interval: 'Min1' | 'Min5' }) => {
      return `spot@public.kline.v3.api.pb@${symbol.toUpperCase()}@${interval}`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('spot@public.aggre.depth.v3.api.pb@')) {
      const [, , speedMs, symbol] = stream.split('@')
      const speed = +speedMs.split('ms')[0] as 100 | 10

      if (speed !== 100 && speed !== 10) {
        throw `Invalid: ${stream}`
      }

      return { subscription: 'diffBookDepth', params: { symbol, speed } }
    }

    if (stream.startsWith('spot@public.aggre.deals.v3.api.pb@')) {
      const [, , speedMs, symbol] = stream.split('@')
      const speed = +speedMs.split('ms')[0] as 100 | 10

      if (speed !== 100 && speed !== 10) {
        throw `Invalid: ${stream}`
      }

      return { subscription: 'trades', params: { symbol, speed } }
    }

    if (stream.startsWith('spot@public.kline.v3.api.pb@')) {
      const [, , symbol, intervalStr] = stream.split('@')
      const interval = intervalStr as 'Min1' | 'Min5'

      if (interval !== 'Min1' && interval !== 'Min5') {
        throw `Invalid: ${stream}`
      }

      return { subscription: 'kline', params: { symbol, interval } }
    }

    throw `invalid mexc stream: ${stream}`
  }
})
