export namespace MexcMessages {
  export interface depthUpdate {
    channel: `spot@public.aggre.depth.v3.api.pb@${100 | 10}ms@${string}`
    symbol: string
    sendTime: string
    publicAggreDepths: {
      asks?: { price: string; quantity: string }[]
      bids?: { price: string; quantity: string }[]
      eventType: `spot@public.aggre.depth.v3.api.pb@${100 | 10}ms`
      fromVersion: string
      toVersion: string
    }
  }

  export interface tradeUpdate {
    channel: `spot@public.aggre.deals.v3.api.pb@${100 | 10}ms@${string}`
    symbol: string
    sendTime: string
    publicAggreDeals: {
      deals: {
        price: string
        quantity: string
        tradeType: 1 | 2 // Trade type (1: Buy, 2: Sell)
        time: string
      }[]
      eventType: `spot@public.aggre.deals.v3.api.pb@${100 | 10}ms`
    }
  }

  export interface klineUpdate {
    channel: `spot@public.kline.v3.api.pb@${string}@${'Min1' | 'Min5'}`
    symbol: string
    symbolId: string
    createTime: number
    publicSpotKline: {
      interval: 'Min1' | 'Min5'
      windowStart: string
      openingPrice: string
      closingPrice: string
      highestPrice: string
      lowestPrice: string
      volume: string
      amount: string
      windowEnd: string
    }
  }
}

export type AnyMexcMessage =
  | MexcMessages.depthUpdate
  | MexcMessages.klineUpdate
  | MexcMessages.tradeUpdate
