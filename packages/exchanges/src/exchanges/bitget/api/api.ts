import { AxiosError } from 'axios'
import { sortObject } from '../../../utils'
import { ApiClient } from '../../../api'
import { Candle } from '@troovi/chart'
import { getBase64Signature } from '../../../crypto'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Options {
  apiKey: string
  apiSecret: string
  passPhrase: string
}

interface Response<T> {
  code: string
  msg: string
  requestTime: number
  data: T
}

export namespace BitgetRequests {
  export interface SpotSymbols {
    symbol?: string
  }

  export interface FuturesSymbols {
    symbol?: string
    productType: 'usdt-futures'
  }

  export interface TradeFee {
    symbol: string
    businessType: 'mix' | 'spot'
  }

  export interface SpotCandles {
    symbol: string
    granularity: '1min' | '5min'
    startTime?: number
    endTime?: number
    limit?: 100 | 1000
  }

  export interface FuturesCandles {
    symbol: string
    productType: 'usdt-futures'
    granularity: '1m' | '5m'
    startTime?: number
    endTime?: number
    limit?: 100 | 1000
  }
}

export namespace BitgetResponses {
  export interface SpotInstrumentInfo {
    symbol: string
    baseCoin: string
    quoteCoin: string
    minTradeAmount: string
    maxTradeAmount: string
    takerFeeRate: string
    makerFeeRate: string
    pricePrecision: string
    quantityPrecision: string
    quotePrecision: string
    status: 'online' | 'offline' | 'gray' | 'online' | 'halt'
    minTradeUSDT: string
    buyLimitPriceRatio: string
    sellLimitPriceRatio: string
    areaSymbol: 'yes' | 'no'
    orderQuantity: string
    openTime: string
    offTime: ''
  }

  export interface FuturesInstrumentInfo {
    symbol: string
    baseCoin: string
    quoteCoin: string
    buyLimitPriceRatio: string
    sellLimitPriceRatio: string
    feeRateUpRatio: string
    makerFeeRate: string
    takerFeeRate: string
    openCostUpRatio: string
    supportMarginCoins: string[]
    minTradeNum: string
    priceEndStep: string
    volumePlace: string
    pricePlace: string
    sizeMultiplier: string
    symbolType: 'perpetual' | 'delivery'
    minTradeUSDT: string
    maxSymbolOrderNum: string
    maxProductOrderNum: string
    maxPositionNum: string
    symbolStatus: 'normal' | 'listed' | 'maintain' | 'limit_open' | 'restrictedAPI' | 'off'
    offTime: string
    limitOpenTime: string
    deliveryTime: ''
    deliveryStartTime: ''
    deliveryPeriod: ''
    launchTime: ''
    fundInterval: string
    minLever: '1'
    maxLever: string
    posLimit: string
    maintainTime: ''
    openTime: ''
    maxMarketOrderQty: string
    maxOrderQty: string
  }

  export interface Fee {
    makerFeeRate: string
    takerFeeRate: string
  }

  export type Candle = [
    string, // timestamp
    string, // open
    string, // high
    string, // low
    string, // close
    string, // vol
    string // amount
  ]
}

interface APIs {
  '/api/v2/spot/public/symbols': {
    params: BitgetRequests.SpotSymbols
    answer: Response<BitgetResponses.SpotInstrumentInfo[]>
  }
  '/api/v2/mix/market/contracts': {
    params: BitgetRequests.FuturesSymbols
    answer: Response<BitgetResponses.FuturesInstrumentInfo[]>
  }
  '/api/v2/spot/market/candles': {
    params: BitgetRequests.SpotCandles
    answer: Response<BitgetResponses.Candle[]>
  }
  '/api/v2/mix/market/candles': {
    params: BitgetRequests.FuturesCandles
    answer: Response<BitgetResponses.Candle[]>
  }
}

export class BitgetApi extends ApiClient<APIs> {
  constructor({ apiKey, apiSecret, passPhrase }: Options) {
    super(`https://api.bitget.com`, {
      name: 'bitget',
      authStrategy: (method, endpoint, options) => {
        const timestamp = new Date(Date.now()).toISOString()
        const request: Record<string, object | string> = { url: endpoint }

        const prehash = [timestamp, method, endpoint]

        if (method === 'GET') {
          const query = new URLSearchParams(sortObject(options)).toString()

          if (query) {
            request.url += `?${query}`
          }
          // add payload
          prehash.push(`?${query}`)
        } else {
          request.body = options
          // add payload
          prehash.push(JSON.stringify(options))
        }

        return {
          method,
          ...request,
          headers: {
            'ACCESS-KEY': apiKey,
            'ACCESS-SIGN': getBase64Signature(apiSecret, prehash.join('')),
            'ACCESS-TIMESTAMP': timestamp,
            'ACCESS-PASSPHRASE': passPhrase
          }
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRectError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ retCode?: number }>) => {
      if (e?.response?.data?.retCode === 10002) {
        console.log('recvWindow error, retry...')
        return this.handleRectError(request)
      }

      throw e
    })
  }

  // Frequency limit: 20 times/1s (IP)
  // https://www.bitget.com/api-doc/spot/market/Get-Symbols

  private spotSymbolsLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 1000,
    name: 'bitget'
  })

  getSpotSymbols(params: BitgetRequests.SpotSymbols = {}) {
    return this.spotSymbolsLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v2/spot/public/symbols', params)
    })
  }

  // Rate Limit: 20 req/sec/IP
  // https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts

  private contractsLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 1000,
    name: 'bitget'
  })

  getContracts(params: BitgetRequests.FuturesSymbols) {
    return this.contractsLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v2/mix/market/contracts', params)
    })
  }

  // Frequency limit: 10 times/1s (UID)
  // https://www.bitget.com/api-doc/common/public/Get-Trade-Rate

  private ratesLimiter = new FrequencyLimiter({
    limit: 5,
    interval: 1000,
    name: 'bitget'
  })

  getFee(params: BitgetRequests.TradeFee) {
    return this.ratesLimiter.wrap(1, () => {
      return this.signRequest<Response<BitgetResponses.Fee>>('GET', '/api/v2/common/trade-rate', params)
    })
  }

  // Frequency limit: 20 times/1s (IP)
  // https://www.bitget.com/api-doc/spot/market/Get-Candle-Data

  private spotKlinesLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 1000,
    name: 'bitget'
  })

  getSpotChart(params: BitgetRequests.SpotCandles): Promise<Candle[]> {
    return this.spotKlinesLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v2/spot/market/candles', params).then(({ data }) => {
        return data.map(([timestamp, open, high, low, close, volume, quoteVolume]) => ({
          time: +timestamp,
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

  // Frequency limit: 20 times/1s (IP)
  // https://www.bitget.com/api-doc/contract/market/Get-Candle-Data

  private mixKlinesLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 1000,
    name: 'bitget'
  })

  getFuturesChart(params: BitgetRequests.FuturesCandles): Promise<Candle[]> {
    return this.mixKlinesLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v2/mix/market/candles', params).then(({ data }) => {
        return data.map(([timestamp, open, high, low, close, volume, quoteVolume]) => ({
          time: +timestamp,
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
