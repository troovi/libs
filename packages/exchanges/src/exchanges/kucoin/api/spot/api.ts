import { AxiosError } from 'axios'
import { Candle } from '@troovi/chart'
import { ApiClient } from '../../../../api'
import { createAuthStratrgy } from '../authStrategy'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Response<T> {
  code: string
  data: T
}

namespace Requests {
  // For each query, the system would return at most 1500 pieces of data
  export interface Klines {
    symbol: string
    type: '1min' | '5min'
    startAt?: number
    endAt?: number
  }

  export interface Fees {
    symbols: string[]
  }

  export interface OrderBook {
    symbol: string
  }
}

namespace Responses {
  export interface InfoSymbol {
    symbol: string
    name: string
    baseCurrency: string
    quoteCurrency: string
    feeCurrency: string
    market: string
    baseMinSize: string
    quoteMinSize: string
    baseMaxSize: string
    quoteMaxSize: string
    baseIncrement: string
    quoteIncrement: string
    priceIncrement: string
    priceLimitRate: string
    minFunds: string
    isMarginEnabled: boolean
    enableTrading: boolean
  }

  export type Kline = [
    string, //Start time of the candle cycle
    string, //opening price
    string, //closing price
    string, //highest price
    string, //lowest price
    string, //Transaction volume
    string //Transaction amount
  ]

  export interface Fee {
    symbol: string
    takerFeeRate: string
    makerFeeRate: string
  }

  export interface OrderBook {
    sequence: string
    time: number
    bids: [string, string][] // [price，size]
    asks: [string, string][]
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
  '/api/v2/symbols': {
    params: {}
    answer: Response<Responses.InfoSymbol[]>
  }
  '/api/v1/market/candles': {
    params: Requests.Klines
    answer: Response<Responses.Kline[]>
  }
  '/api/v1/bullet-public': {
    params: {}
    answer: Response<Responses.WSInfo>
  }
  '/api/v1/market/orderbook/level2_100': {
    params: Requests.OrderBook
    answer: Response<Responses.OrderBook>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
  apiPassword: string
}

export class KuCoinSpotApi extends ApiClient<APIs> {
  private publicLimiter = new FrequencyLimiter({
    limit: 2000,
    interval: 25 * 1000,
    name: 'kucoin'
  })

  private spotLimiter = new FrequencyLimiter({
    limit: 4000,
    interval: 25 * 1000,
    name: 'kucoin'
  })

  constructor(options: Options) {
    super(`https://api.kucoin.com`, {
      name: 'kucoin-spot',
      authStrategy: createAuthStratrgy(options),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRecvError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: string }>) => {
      if (e?.response?.data?.code === '400002') {
        console.log('recvWindow error, retry...')
        return this.handleRecvError(request)
      }

      throw e
    })
  }

  // api

  getSymbols() {
    return this.publicLimiter.wrap(4, () => {
      return this.apiRequest('GET', '/api/v2/symbols', {}).then(({ data }) => data)
    })
  }

  // https://www.kucoin.com/docs/rest/funding/trade-fee/trading-pair-actual-fee-spot-margin-trade_hf

  getFees(symbols: string[]) {
    return this.spotLimiter.wrap(3, () => {
      return this.signRequest<Response<Responses.Fee[]>>('GET', '/api/v1/trade-fees', {
        symbols
      })
    })
  }

  // https://www.kucoin.com/docs/rest/spot-trading/market-data/get-klines

  getChart(params: Requests.Klines): Promise<Candle[]> {
    return this.publicLimiter.wrap(3, () => {
      return this.apiRequest('GET', '/api/v1/market/candles', params).then(({ data }) => {
        return data.map(([time, open, close, high, low, volume, quoteVolume]) => ({
          time: +time * 1000,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
          quoteVolume: +quoteVolume
        }))
      })
    })
  }

  // https://www.kucoin.com/docs/rest/spot-trading/market-data/get-part-order-book-aggregated-

  getOrderBook(params: Requests.OrderBook) {
    return this.publicLimiter.wrap(4, () => {
      return this.apiRequest('GET', '/api/v1/market/orderbook/level2_100', params).then(
        ({ data }) => data
      )
    })
  }

  getWSPublicInfo() {
    return this.publicLimiter.wrap(10, () => {
      return this.apiRequest('POST', '/api/v1/bullet-public', {}).then(({ data }) => {
        return data
      })
    })
  }

  getWSPrivateInfo() {
    return this.publicLimiter.wrap(10, () => {
      return this.signRequest<Response<Responses.WSInfo>>('POST', '/api/v1/bullet-private', {}).then(
        ({ data }) => {
          return data
        }
      )
    })
  }
}

export type { Requests as KuCoinSpotRequests, Response as KuCoinSpotResponses }
