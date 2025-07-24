import { AxiosError } from 'axios'
import { Candle } from '@troovi/chart'
import { ApiClient } from '../../../../api'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Response<T> {
  code: string
  trace: string
  message: string
  data: T
}

namespace Requests {
  export interface Klines {
    symbol: string
    before?: number
    after?: number
    step?: 1 | 5
    limit: 100 | 200
  }

  export interface Fees {
    symbol: string
  }
}

namespace Responses {
  export type Kline = [
    string, // t
    string, // o
    string, // h
    string, // l
    string, // c
    string, // v
    string // qv
  ]

  export interface InfoSymbol {
    symbols: {
      symbol: string
      symbol_id: number
      base_currency: string
      quote_currency: string
      quote_increment: string
      base_min_size: string
      price_min_precision: number
      price_max_precision: number
      expiration: 'NA'
      min_buy_amount: string
      min_sell_amount: string
      trade_status: 'trading' | 'pre-trade'
    }[]
  }

  export interface Fee {
    symbol: string
    buy_taker_fee_rate: string
    sell_taker_fee_rate: string
    buy_maker_fee_rate: string
    sell_maker_fee_rate: string
  }
}

interface APIs {
  '/spot/v1/symbols/details': {
    params: {}
    answer: Response<Responses.InfoSymbol>
  }
  '/spot/v1/trade_fee': {
    params: Requests.Fees
    answer: Response<Responses.Fee>
  }
  '/spot/quotation/v3/klines': {
    params: Requests.Klines
    answer: Response<Responses.Kline[]>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class BitmartSpotApi extends ApiClient<APIs> {
  constructor({ apiKey }: Options) {
    super(`https://api-cloud.bitmart.com`, {
      name: 'bitmart-spot',
      authStrategy: () => ({}),
      headers: {
        'X-BM-KEY': apiKey
      }
    })
  }

  handleRecvError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: number }>) => {
      if (e?.response?.data?.code === 700003) {
        console.log('recvWindow error, retry...')
        return this.handleRecvError(request)
      }

      throw e
    })
  }

  // 12 times / 2 sec (IP)
  // https://developer-pro.bitmart.com/en/spot/#get-trading-pair-details-v1

  private symbolDetailsLimiter = new FrequencyLimiter({
    limit: 12,
    interval: 2 * 1000,
    name: 'bitmart'
  })

  getSymbols() {
    return this.symbolDetailsLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/spot/v1/symbols/details', {}).then(({ data }) => data)
    })
  }

  // 2 times / 2 sec (KEY)
  // https://developer-pro.bitmart.com/en/spot/#get-actual-trade-fee-rate-keyed

  private feesLimiter = new FrequencyLimiter({
    limit: 1,
    interval: 1250,
    threshold: 0,
    name: 'bitmart'
  })

  getFee(symbol: string) {
    return this.feesLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/spot/v1/trade_fee', { symbol })
    })
  }

  // 10 times / 2 sec (IP)
  // https://developer-pro.bitmart.com/en/spot/#get-history-k-line-v3

  private klinesLimiter = new FrequencyLimiter({
    limit: 10,
    interval: 2 * 1000,
    name: 'bitmart'
  })

  getChart(params: Requests.Klines): Promise<Candle[]> {
    return this.klinesLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/spot/quotation/v3/klines', params).then(({ data }) => {
        return data.map(([time, open, high, low, close, volume, quoteVolume]) => ({
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
}
