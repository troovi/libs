import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    diffBookDepth({ symbol, speed }: { symbol: string; speed: 100 | 10 }) {
      return `spot@public.aggre.depth.v3.api.pb@${speed}ms@${symbol.toUpperCase()}`
    },
    trades({ symbol, speed }: { symbol: string; speed: 100 | 10 }) {
      return `spot@public.aggre.deals.v3.api.pb@${speed}ms@${symbol.toUpperCase()}`
    },
    kline({ symbol, interval }: { symbol: string; interval: 'Min1' | 'Min5' }) {
      return `spot@public.kline.v3.api.pb@${symbol.toUpperCase()}@${interval}`
    }
  },
  getStreams: (streams: string | string[]) => {
    return Array.isArray(streams) ? streams : [streams]
  }
})
