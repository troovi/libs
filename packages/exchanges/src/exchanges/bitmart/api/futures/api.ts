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
    start_time: number
    end_time: number
    step?: 1 | 5
  }

  export interface Fees {
    symbol: string
  }

  export interface Contracts {
    symbol?: string
  }
}

namespace Responses {
  export interface Kline {
    timestamp: number
    open_price: string
    close_price: string
    high_price: string
    low_price: string
    volume: string
  }

  export interface Contracts {
    symbols: {
      symbol: string
      product_type: 1 | 2 // Contract type 1 = perpetual; 2 = futures
      open_timestamp: number
      expire_timestamp: 0
      settle_timestamp: 0
      base_currency: string
      quote_currency: string
      last_price: string
      volume_24h: string
      turnover_24h: string
      index_price: string
      index_name: string
      contract_size: string
      min_leverage: string
      max_leverage: string
      price_precision: string
      vol_precision: string
      max_volume: string
      min_volume: string
      funding_rate: string
      expected_funding_rate: string
      open_interest: string
      open_interest_value: string
      high_24h: string
      low_24h: string
      change_24h: string
      funding_time: number
      market_max_volume: string
      funding_interval_hours: number
      status: 'Trading' | 'Delisted'
      delist_time: 0
    }[]
  }

  export interface Fee {
    symbol: string
    taker_fee_rate: string
    maker_fee_rate: string
  }
}

interface APIs {
  '/contract/public/details': {
    params: {}
    answer: Response<Responses.Contracts>
  }
  '/contract/private/trade-fee-rate': {
    params: Requests.Fees
    answer: Response<Responses.Fee>
  }
  '/contract/public/kline': {
    params: Requests.Klines
    answer: Response<Responses.Kline[]>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class BitMartFuturesApi extends ApiClient<APIs> {
  constructor({ apiKey }: Options) {
    super(`https://api-cloud-v2.bitmart.com`, {
      name: 'bitmart-futures',
      authStrategy: () => ({}),
      headers: {
        'X-BM-KEY': apiKey
      }
    })
  }

  handleRectError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: number }>) => {
      if (e?.response?.data?.code === 700003) {
        console.log('recvWindow error, retry...')
        return this.handleRectError(request)
      }

      throw e
    })
  }

  // 12 times / 2 sec (IP)
  // https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details

  private symbolDetailsLimiter = new FrequencyLimiter({
    limit: 12,
    interval: 2 * 1000,
    name: 'bitmart'
  })

  getContracts(symbol?: string) {
    return this.symbolDetailsLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/contract/public/details', { symbol }).then(({ data }) => data)
    })
  }

  // 2 times / 2 sec (KEY)
  // https://developer-pro.bitmart.com/en/futuresv2/#get-trade-fee-rate-keyed

  private feesLimiter = new FrequencyLimiter({
    limit: 1,
    interval: 2000,
    threshold: 500,
    name: 'bitmart'
  })

  getFee(symbol: string) {
    return this.feesLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/contract/private/trade-fee-rate', { symbol })
    })
  }

  // 12 times/2 sec
  // https://developer-pro.bitmart.com/en/futuresv2/#get-k-line

  private klinesLimiter = new FrequencyLimiter({
    limit: 12,
    interval: 2 * 1000,
    name: 'bitmart'
  })

  getChart(params: Requests.Klines): Promise<Candle[]> {
    return this.klinesLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/contract/public/kline', params).then(({ data }) => {
        return data.map(({ timestamp, open_price, high_price, low_price, close_price, volume }) => ({
          time: +timestamp * 1000,
          open: +open_price,
          high: +high_price,
          low: +low_price,
          close: +close_price,
          volume: +volume,
          quoteVolume: 0
        }))
      })
    })
  }
}
