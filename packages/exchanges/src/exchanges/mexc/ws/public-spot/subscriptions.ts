export const MexcPublicSubscriptions = {
  diffBookDepth({ symbol, speed }: { symbol: string; speed: 100 | 10 }) {
    return `spot@public.aggre.depth.v3.api.pb@${speed}ms@${symbol.toUpperCase()}`
  },

  trades({ symbol, speed }: { symbol: string; speed: 100 | 10 }) {
    return `spot@public.aggre.deals.v3.api.pb@${speed}ms@${symbol.toUpperCase()}`
  },

  kline({ symbol, interval }: { symbol: string; interval: 'Min1' | 'Min5' }) {
    return `spot@public.kline.v3.api.pb@${symbol.toUpperCase()}@${interval}`
  }
}
