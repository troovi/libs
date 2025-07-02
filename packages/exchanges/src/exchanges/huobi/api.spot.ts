import { AxiosError } from 'axios'
import { Candle } from '@troovi/chart'
import { ApiClient } from '../../api'
import { createAuthStrategy } from './authStrategy'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Response<T> {
  data: T
}

namespace Requests {
  export interface FeeRate {
    symbols: string[]
  }

  export interface Kline {
    symbol: string
    period: '1min' | '5min'
    size?: 150 | 1000 | 2000
  }
}

namespace Responses {
  export interface SymbolInfo {
    'base-currency': string
    'quote-currency': string
    'price-precision': number
    'amount-precision': number
    'symbol-partition': string
    symbol: string
    state: 'offline' | 'online' | 'suspend'
    'value-precision': number
    'min-order-amt': number
    'max-order-amt': number
    'min-order-value': number
    'limit-order-min-order-amt': number
    'limit-order-max-order-amt': number
    'limit-order-max-buy-amt': number
    'limit-order-max-sell-amt': number
    'buy-limit-must-less-than': number
    'sell-limit-must-greater-than': number
    'sell-market-min-order-amt': number
    'sell-market-max-order-amt': number
    'buy-market-max-order-value': number
    'market-sell-order-rate-must-less-than': number
    'market-buy-order-rate-must-less-than': number
    'api-trading': 'enabled' | 'disabled'
  }

  export interface Kline {
    id: number
    amount: number
    count: number
    open: number
    close: number
    low: number
    high: number
    vol: number
  }

  export interface FeeRate {
    symbol: string
    makerFeeRate: string
    takerFeeRate: string
    actualMakerRate: string
    actualTakerRate: string
  }
}

interface APIs {
  '/v1/common/symbols': {
    params: {}
    answer: Response<Responses.SymbolInfo[]>
  }
  '/market/history/kline': {
    params: Requests.Kline
    answer: Response<Responses.Kline[]>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class HuobiSpotApi extends ApiClient<APIs> {
  private baseLimiter = new FrequencyLimiter({
    limit: 10,
    interval: 1 * 1000,
    name: 'htx'
  })

  private rateLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 2 * 1000,
    name: 'htx'
  })

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.huobi.pro`, {
      name: 'huobi-spot',
      authStrategy: createAuthStrategy({ apiKey, apiSecret, host: `api.huobi.pro` }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRectError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: number }>) => {
      if (e?.response?.data?.code === 10003) {
        console.log('recvWindow error, retry...')
        return this.handleRectError(request)
      }

      throw e
    })
  }

  // https://docs.trade.newhuotech.com/docs/spot/v1/en/#get-all-supported-trading-symbol

  getSymbols() {
    return this.baseLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/v1/common/symbols', {}).then(({ data }) => data)
    })
  }

  // https://docs.trade.newhuotech.com/docs/spot/v1/en/#get-current-fee-rate-applied-to-the-user

  getFees(symbols: string[]) {
    return this.rateLimiter.wrap(1, () => {
      return this.signRequest<Response<Responses.FeeRate[]>>('GET', '/v2/reference/transact-fee-rate', {
        symbols
      })
    })
  }

  // https://docs.trade.newhuotech.com/docs/spot/v1/en/#get-klines-candles

  getChart(params: Requests.Kline): Promise<Candle[]> {
    return this.baseLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/market/history/kline', params).then(({ data }) => {
        return data.map(({ id, high, open, low, close, vol, amount }) => ({
          time: +id,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +vol,
          quoteVolume: +amount
        }))
      })
    })
  }
}
