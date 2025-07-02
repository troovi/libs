import { AxiosError } from 'axios'
import { Candle } from '@troovi/chart'
import { ApiClient } from '../../api'
import { sortObject } from '../../utils'
import { getHexSignature } from '../../crypto'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Response<T> {
  code: number
  message: string
  data: T
}

namespace Requests {
  export interface FeeRate {
    market_type: 'SPOT' | 'FUTURES'
    market: string
  }

  export interface Market {
    market?: string
  }

  export interface Candlestick {
    market: string
    price_type?: 'latest_price' | 'mark_price' | 'index_price'
    limit?: 100 | 1000
    period: '1min' | '5min'
  }

  export interface SiteKlines {
    market: string
    start_time: number
    end_time: number
    interval: 60 | 300
  }
}

namespace Responses {
  export interface SpotMarket {
    base_ccy: string
    base_ccy_precision: number
    is_amm_available: boolean
    is_api_trading_available: boolean
    is_margin_available: boolean
    is_pre_market_trading_available: boolean
    maker_fee_rate: string
    market: string
    min_amount: string
    quote_ccy: string
    quote_ccy_precision: number
    status: 'online' | 'counting_down' | 'bidding'
    taker_fee_rate: string
  }

  export interface FuturesMarket {
    base_ccy: string
    base_ccy_precision: number
    contract_type: 'inverse' | 'linear'
    is_copy_trading_available: boolean
    is_market_available: boolean
    leverage: string[]
    maker_fee_rate: string
    market: string
    min_amount: string
    open_interest_volume: string
    quote_ccy: string
    quote_ccy_precision: number
    status: 'online' | 'counting_down' | 'bidding'
    taker_fee_rate: string
    tick_size: string
  }

  export interface Kline {
    market: string
    created_at: number
    open: string
    close: string
    high: string
    low: string
    volume: string
    value: string
  }

  export type SiteKline = [
    number, // timestamp
    string, // open
    string, // close
    string, // high
    string, // low
    string, // volume
    string // quoteVolume
  ]

  export interface FeeRate {
    market: string
    maker_rate: string
    taker_rate: string
  }
}

interface APIs {
  '/v2/spot/market': {
    params: Requests.Market
    answer: Response<Responses.SpotMarket[]>
  }
  '/v2/futures/market': {
    params: Requests.Market
    answer: Response<Responses.FuturesMarket[]>
  }
  '/v2/spot/kline': {
    params: Requests.Candlestick
    answer: Response<Responses.Kline[]>
  }
  '/v2/futures/kline': {
    params: Requests.Candlestick
    answer: Response<Responses.Kline[]>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class CoinExApi extends ApiClient<APIs> {
  private spotAccountLimiter = new FrequencyLimiter({
    limit: 10,
    interval: 1 * 1000,
    name: 'coinex'
  })

  private baseLimiter = new FrequencyLimiter({
    limit: 100,
    interval: 1 * 1000,
    name: 'coinex'
  })

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.coinex.com`, {
      name: 'coinex',
      authStrategy: (method, endpoint, options) => {
        const timestamp = Date.now().toString()
        const params: Record<string, object | string> = {}

        const prehash = [method, endpoint]

        if (method === 'GET') {
          const query = new URLSearchParams(sortObject(options)).toString()

          if (query) {
            prehash.push(`?${query}`)
            endpoint += `?${query}`
          }
        } else {
          const body = JSON.stringify(options)

          if (body) {
            prehash.push(body)
            params.body = options
          }
        }

        prehash.push(timestamp)

        return {
          method,
          url: endpoint,
          ...params,
          headers: {
            'X-COINEX-KEY': apiKey,
            'X-COINEX-SIGN': getHexSignature(apiSecret, prehash.join('')),
            'X-COINEX-TIMESTAMP': timestamp
          }
        }
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

  // https://docs.coinex.com/api/v2/spot/market/http/list-market

  getSpotMarkets(params: Requests.Market = {}) {
    return this.baseLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/v2/spot/market', params).then(({ data }) => data)
    })
  }

  // https://docs.coinex.com/api/v2/futures/market/http/list-market

  getFuturesMarkets(params: Requests.Market = {}) {
    return this.baseLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/v2/futures/market', params).then(({ data }) => data)
    })
  }

  // https://docs.coinex.com/api/v2/account/fees/http/get-account-trade-fees

  getFee(params: Requests.FeeRate) {
    return this.spotAccountLimiter.wrap(1, () => {
      return this.signRequest<Response<Responses.FeeRate>>('GET', '/v2/account/trade-fee-rate', params)
    })
  }

  // // https://docs.coinex.com/api/v2/futures/market/http/list-market-kline

  // getSpotChart(params: Requests.Candlestick): Promise<Candle[]> {
  //   return this.baseLimiter.wrap(1, () => {
  //     return this.apiRequest('GET', '/v2/spot/kline', params).then(({ data }) => {
  //       return data.map(({ created_at, high, open, low, close, volume, value }) => ({
  //         time: +created_at,
  //         open: +open,
  //         high: +high,
  //         low: +low,
  //         close: +close,
  //         volume: +volume,
  //         quoteVolume: +value
  //       }))
  //     })
  //   })
  // }

  // // https://docs.coinex.com/api/v2/futures/market/http/list-market-kline

  // getFuturesChart(params: Requests.Candlestick): Promise<Candle[]> {
  //   return this.baseLimiter.wrap(1, () => {
  //     return this.apiRequest('GET', '/v2/futures/kline', params).then(({ data }) => {
  //       return data.map(({ created_at, high, open, low, close, volume, value }) => ({
  //         time: +created_at,
  //         open: +open,
  //         high: +high,
  //         low: +low,
  //         close: +close,
  //         volume: +volume,
  //         quoteVolume: +value
  //       }))
  //     })
  //   })
  // }

  // web site api
  getSpotChart(params: Requests.SiteKlines): Promise<Candle[]> {
    return this.baseLimiter.wrap(1, () => {
      return this.request<Response<Responses.SiteKline[]>>({
        url: `https://www.coinex.com/res/market/kline`,
        method: 'GET',
        params
      }).then((result) => {
        return result.data.map(([timestamp, open, close, high, low, volume, quoteVolume]) => ({
          time: +timestamp * 1000,
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

  // web site api
  getFuturesChart(params: Requests.SiteKlines): Promise<Candle[]> {
    return this.baseLimiter.wrap(1, () => {
      return this.request<Response<Responses.SiteKline[]>>({
        url: `https://www.coinex.com/res/contract/market/kline`,
        method: 'GET',
        params
      }).then(({ data }) => {
        return data.map(([timestamp, open, close, high, low, volume, quoteVolume]) => ({
          time: +timestamp * 1000,
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
