import { ExchangeFilter, RateLimiter } from '../spot/types'
import { ApiClient } from '../../../../api'
import { BinanceLimiter } from '../limiter'
import { AssetInforamtion, FuturesSymbolExchangeInfo } from './types'
import { sortObject } from '../../../../utils'
import { getHexSignature } from '../../../../crypto'

interface Options {
  apiKey: string
  apiSecret: string
}

namespace Requests {
  export interface TradeFee {
    symbol: string
  }

  export interface Klines {
    symbol: string
    interval?: '1m' | '5m'
    startTime?: number
    endTime?: number
    limit?: 500 | 1000 | 1500
  }

  export interface OrderBook {
    symbol: string
    limit?: 5 | 10 | 20 | 50 | 100 | 500 | 1000 | 5000
  }
}

namespace Responses {
  export interface ExchangeInfo {
    exchangeFilters: ExchangeFilter[]
    rateLimits: RateLimiter[]
    serverTime: number
    assets: AssetInforamtion[]
    symbols: FuturesSymbolExchangeInfo[]
    timezone: string
  }

  export interface SymbolTradeFee {
    symbol: string
    makerCommissionRate: string
    takerCommissionRate: string
  }

  export type Klines = [
    number, // Kline open time
    string, // Open price
    string, // High price
    string, // Low price
    string, // Close price
    string, // Volume
    number, // Kline Close time
    string, // Quote asset volume
    number, // Number of trades
    string, // Taker buy base asset volume
    string // Taker buy quote asset volume
  ][]

  export interface OrderBook {
    lastUpdateId: number
    E: number
    T: number
    bids: [string, string][]
    asks: [string, string][]
  }
}

interface APIs {
  '/fapi/v1/exchangeInfo': {
    params: {}
    answer: Responses.ExchangeInfo
  }
  '/fapi/v1/klines': {
    params: Requests.Klines
    answer: Responses.Klines
  }
  '/fapi/v1/depth': {
    params: Requests.OrderBook
    answer: Responses.OrderBook
  }
}

export class BinanceFuturesApi extends ApiClient<APIs> {
  private limiter: BinanceLimiter['limiter']

  constructor({ apiKey, apiSecret }: Options) {
    const limiter = new BinanceLimiter()

    super(`https://fapi.binance.com`, {
      name: 'binance-futures',
      authStrategy: (method, url, options) => {
        const params = sortObject({
          ...options,
          timestamp: (Date.now() - 200).toString()
        })

        const query = new URLSearchParams(params)
        query.append('signature', getHexSignature(apiSecret, query.toString()))

        return {
          method,
          url: `${url}?${query.toString()}`,
          headers: {
            'X-MBX-APIKEY': apiKey
          }
        }
      },
      catchHeaders: (headers = {}) => {
        limiter.headersControll.updateApiLimitState(headers)
      }
    })

    this.limiter = (request) => {
      return limiter.limiter(request)
    }
  }

  getExchangeInfo() {
    return this.limiter(() => {
      return this.apiRequest('GET', '/fapi/v1/exchangeInfo', {})
    })
  }

  getTradeFee(params: Requests.TradeFee) {
    return this.limiter(() => {
      return this.signRequest<Responses.SymbolTradeFee>('GET', '/fapi/v1/commissionRate', params)
    })
  }

  getOrderBook(params: Requests.OrderBook) {
    return this.limiter(() => {
      return this.apiRequest('GET', '/fapi/v1/depth', params)
    })
  }

  // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
  getChart(params: Requests.Klines) {
    return this.limiter(() => {
      return this.apiRequest('GET', '/fapi/v1/klines', params).then((data) => {
        return data.map(([time, open, high, low, close, volume, , quoteVolume]) => ({
          time,
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

export type { Requests as BinanceFuturesRequests, Responses as BinanceFuturesResponses }
