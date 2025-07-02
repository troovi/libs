import { AxiosError } from 'axios'
import { Candle } from '@troovi/chart'
import { ApiClient } from '../../../../api'
import { createAuthStratrgy } from '../authStrategy'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Response<T> {
  code: string
  data: T
}

export namespace Requests {
  // The maximum size per request is 500.
  export interface Klines {
    symbol: string
    granularity: 1 | 5
    from?: number
    to?: number
  }

  export interface Fees {
    symbols: string[]
  }

  export interface OrderBook {
    symbol: string
  }
}

export namespace Responses {
  export interface InfoSymbol {
    symbol: string
    rootSymbol: string
    type: string
    firstOpenDate: number
    expireDate: null | number
    settleDate: null | number
    baseCurrency: string
    quoteCurrency: string
    settleCurrency: string
    maxOrderQty: number
    maxPrice: number
    lotSize: number
    tickSize: number
    indexPriceTickSize: number
    multiplier: number
    initialMargin: number
    maintainMargin: number
    maxRiskLimit: number
    minRiskLimit: number
    riskStep: number
    makerFeeRate: number
    takerFeeRate: number
    takerFixFee: number
    makerFixFee: number
    settlementFee: null
    isDeleverage: boolean
    isQuanto: boolean
    isInverse: boolean
    markMethod: 'FairPrice'
    fairMethod: 'FundingRate'
    fundingBaseSymbol: string
    fundingQuoteSymbol: string
    fundingRateSymbol: string
    indexSymbol: string
    settlementSymbol: string
    status: 'Open'
    fundingFeeRate: number
    predictedFundingFeeRate: number
    fundingRateGranularity: number
    openInterest: string
    turnoverOf24h: number
    volumeOf24h: number
    markPrice: number
    indexPrice: number
    lastTradePrice: number
    nextFundingRateTime: number
    maxLeverage: number
    sourceExchanges: string[]
    premiumsSymbol1M: string
    premiumsSymbol8H: string
    fundingBaseSymbol1M: string
    fundingQuoteSymbol1M: string
    lowPrice: number
    highPrice: number
    priceChgPct: number
    priceChg: number
    k: number
    m: number
    f: number
    mmrLimit: number
    mmrLevConstant: number
    supportCross: boolean
    buyLimit: number
    sellLimit: number
  }

  export type Kline = [
    number, //Time
    number, //Entry price
    number, //Highest price
    number, //Lowest price
    number, //Close price
    number //Trading volume
  ]

  export interface Fee {
    symbol: string
    takerFeeRate: string
    makerFeeRate: string
  }

  export interface OrderBook {
    symbol: string
    sequence: number
    asks: [string, number][]
    bids: [string, number][]
    ts: number
  }

  export interface WSInfo {
    token: string
    instanceServers: [
      {
        endpoint: string
        encrypt: boolean
        protocol: 'websocket'
        pingInterval: number
        pingTimeout: number
      }
    ]
  }
}

interface APIs {
  '/api/v1/contracts/active': {
    params: {}
    answer: Response<Responses.InfoSymbol[]>
  }
  '/api/v1/kline/query': {
    params: Requests.Klines
    answer: Response<Responses.Kline[]>
  }
  '/api/v1/level2/depth100': {
    params: Requests.OrderBook
    answer: Response<Responses.OrderBook>
  }
  '/api/v1/bullet-public': {
    params: {}
    answer: Response<Responses.WSInfo>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
  apiPassword: string
}

export class KuCoinFuturesApi extends ApiClient<APIs> {
  private publicLimiter = new FrequencyLimiter({
    limit: 2000,
    interval: 25 * 1000,
    name: 'kucoin'
  })

  private futuresLimiter = new FrequencyLimiter({
    limit: 2000,
    interval: 25 * 1000,
    name: 'kucoin'
  })

  constructor(options: Options) {
    super(`https://api-futures.kucoin.com`, {
      name: 'kucoin-futures',
      authStrategy: createAuthStratrgy(options),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRectError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: string }>) => {
      if (e?.response?.data?.code === '400002') {
        console.log('recvWindow error, retry...')
        return this.handleRectError(request)
      }

      throw e
    })
  }

  // api
  getSymbols() {
    return this.publicLimiter.wrap(3, () => {
      return this.apiRequest('GET', '/api/v1/contracts/active', {}).then(({ data }) => data)
    })
  }

  // https://www.kucoin.com/docs/rest/funding/trade-fee/trading-pair-actual-fee-futures

  getFee(symbol: string) {
    return this.futuresLimiter.wrap(3, () => {
      return this.signRequest<Response<Responses.Fee[]>>('GET', '/api/v1/trade-fees', {
        symbol
      })
    })
  }

  // https://www.kucoin.com/docs/rest/futures-trading/market-data/get-klines

  getChart(params: Requests.Klines): Promise<Candle[]> {
    return this.publicLimiter.wrap(3, () => {
      return this.apiRequest('GET', '/api/v1/kline/query', params).then(({ data }) => {
        return data.map(([time, open, high, low, close, volume]) => ({
          time: +time,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
          quoteVolume: 0
        }))
      })
    })
  }

  // https://www.kucoin.com/docs/rest/futures-trading/market-data/get-part-order-book-level-2

  getOrderBook(params: Requests.OrderBook) {
    return this.publicLimiter.wrap(10, () => {
      return this.apiRequest('GET', '/api/v1/level2/depth100', params).then(({ data }) => data)
    })
  }

  getWSPublicInfo() {
    return this.publicLimiter.wrap(10, () => {
      return this.apiRequest('POST', '/api/v1/bullet-public', {}).then(({ data }) => data)
    })
  }

  getWSPrivateInfo() {
    return this.publicLimiter.wrap(10, () => {
      return this.signRequest<Response<Responses.WSInfo>>('POST', '/api/v1/bullet-private', {}).then(
        ({ data }) => data
      )
    })
  }
}

export type { Responses as KuCoinFuturesResponses, Requests as KuCoinFuturesRequests }
