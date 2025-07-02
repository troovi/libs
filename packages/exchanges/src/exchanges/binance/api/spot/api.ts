import { ExchangeFilter, RateLimiter, CoinNetwork } from './types'
import { ApiClient } from '../../../../api'
import { SymbolExchangeInfo } from './types'
import { BinanceLimiter } from '../limiter'
import { sortObject } from '../../../../utils'
import { Candle } from '@troovi/chart'
import { getHexSignature } from '../../../../crypto'

interface Options {
  apiKey: string
  apiSecret: string
}

namespace Requests {
  export interface TradeFee {
    symbol?: string
  }

  export interface ExchangeInfoParams {
    symbol?: string
    symbols?: string[]
    permissions?: string | string[]
    showPermissionSets?: boolean
    symbolStatus?: string
  }

  export interface Klines {
    symbol: string
    interval?: '1m' | '5m'
    startTime?: number
    endTime?: number
    limit?: 500 | 1000
  }

  export interface OrderBook {
    symbol: string
    limit?: 5 | 10 | 20 | 50 | 100 | 500 | 1000 | 5000
  }
}

namespace Responses {
  export interface ExchangeInfo {
    timezone: string
    serverTime: number
    rateLimits: RateLimiter[]
    exchangeFilters: ExchangeFilter[]
    symbols: SymbolExchangeInfo[]
  }

  export interface AllCoins {
    coin: string
    depositAllEnable: boolean
    free: string
    freeze: string
    ipoable: string
    ipoing: string
    isLegalMoney: boolean
    locked: string
    name: string
    networkList: CoinNetwork[]
    storage: string
    trading: boolean
    withdrawAllEnable: boolean
    withdrawing: string
  }

  export interface SymbolTradeFee {
    symbol: string
    makerCommission: string
    takerCommission: string
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
    bids: [string, string][]
    asks: [string, string][]
  }
}

interface APIs {
  '/api/v3/exchangeInfo': {
    params: Requests.ExchangeInfoParams
    answer: Responses.ExchangeInfo
  }
  '/api/v3/klines': {
    params: Requests.Klines
    answer: Responses.Klines
  }
  '/api/v3/depth': {
    params: Requests.OrderBook
    answer: Responses.OrderBook
  }
}

export class BinanceSpotApi extends ApiClient<APIs> {
  private limiter: BinanceLimiter['limiter']

  constructor({ apiKey, apiSecret }: Options) {
    const limiter = new BinanceLimiter()

    super(`https://api.binance.com`, {
      name: 'binance-spot',
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

  getExchangeInfo(params: Requests.ExchangeInfoParams = {}) {
    return this.limiter(() => {
      return this.apiRequest('GET', '/api/v3/exchangeInfo', params)
    })
  }

  getBalances() {
    return this.limiter(() => {
      return this.signRequest<Responses.AllCoins[]>('GET', '/sapi/v1/capital/config/getall', {})
    })
  }

  getTradeFee(params: Requests.TradeFee = {}) {
    return this.limiter(() => {
      return this.signRequest<Responses.SymbolTradeFee[]>('GET', '/sapi/v1/asset/tradeFee', params)
    })
  }

  getOrderBook(params: Requests.OrderBook) {
    return this.limiter(() => {
      return this.apiRequest('GET', '/api/v3/depth', params)
    })
  }

  // https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#klinecandlestick-data
  getChart(params: Requests.Klines): Promise<Candle[]> {
    return this.apiRequest('GET', '/api/v3/klines', params).then((data) => {
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
  }
}

export type { Responses as BinanceSpotResponses, Requests as BinanceSpotRequests }
