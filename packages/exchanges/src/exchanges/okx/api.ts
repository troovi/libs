import { AxiosError } from 'axios'
import { sortObject } from '../../utils'
import { ApiClient } from '../../api'
import { Candle } from '@troovi/chart'
import { FrequencyLimiter } from '@troovi/utils-nodejs'
import { getBase64Signature } from '../../crypto'

interface Options {
  apiKey: string
  apiSecret: string
  passPhrase: string
}

interface Response<T> {
  code: string
  data: T
}

export namespace OKXRequests {
  export interface Instruments {
    instType: 'SPOT' | 'SWAP'
  }

  export interface TradeFee {
    instType: 'SPOT' | 'SWAP'
    ruleType?: 'normal' | 'pre_market'
    instId?: string
    uly?: string
  }

  export interface Candles {
    instId: string
    bar?: '1m' | '5m'
    after?: string
    before?: string
    limit?: 100
  }
}

export namespace OKXResponses {
  export interface InstrumentInfo {
    alias: string
    auctionEndTime: string
    baseCcy: string
    contTdSwTime: string
    ctMult: string
    ctType: 'linear' | 'inverse' | ''
    ctVal: string
    ctValCcy: string
    expTime: string
    futureSettlement: boolean
    instFamily: string
    instId: string
    instType: 'SPOT' | 'SWAP'
    lever: string
    listTime: string
    lotSz: string
    maxIcebergSz: string
    maxLmtAmt: string
    maxLmtSz: string
    maxMktAmt: string
    maxMktSz: string
    maxStopSz: string
    maxTriggerSz: string
    maxTwapSz: string
    minSz: '1'
    openType: string
    optType: string
    quoteCcy: string
    ruleType: 'normal' | 'pre_market'
    settleCcy: string
    state: 'live' | 'suspend' | 'preopen'
    stk: string
    tickSz: string
    uly: string
  }

  export interface Fee {
    category: '1' //Deprecated
    delivery: string
    exercise: string
    instType: 'SPOT' | 'SWAP'
    level: 'lv1'
    maker: string
    makerU: string
    makerUSDC: string
    taker: string
    takerU: string
    takerUSDC: string
    ruleType: 'normal'
    ts: string
    fiat: []
  }

  export type Klines = [
    string, // time
    string, // open
    string, // high
    string, // low
    string, // close
    string, // base volume / contracts
    string, // quoteAmount
    string, // quoteAmount
    '0' | '1' // confirm
  ][]
}

interface APIs {
  '/api/v5/public/instruments': {
    params: OKXRequests.Instruments
    answer: Response<OKXResponses.InstrumentInfo[]>
  }
  '/api/v5/market/history-candles': {
    params: OKXRequests.Candles
    answer: Response<OKXResponses.Klines[]>
  }
}

export class OKXApi extends ApiClient<APIs> {
  constructor({ apiKey, apiSecret, passPhrase }: Options) {
    super(`https://www.okx.com`, {
      name: 'okx',
      authStrategy: (method, endpoint, options) => {
        const query = new URLSearchParams(sortObject(options))

        const timestamp = new Date(Date.now()).toISOString()
        const url = method === 'GET' ? `${endpoint}?${query.toString()}` : endpoint
        const request: Record<string, object | string> = {}

        const prehash = [timestamp, method, url]

        if (method !== 'GET') {
          prehash.push(JSON.stringify(options))
          request.body = options
        }

        return {
          method,
          url,
          ...request,
          headers: {
            'OK-ACCESS-KEY': apiKey,
            'OK-ACCESS-SIGN': getBase64Signature(apiSecret, prehash.join('')),
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': passPhrase
          }
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRecvError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ retCode?: number }>) => {
      if (e?.response?.data?.retCode === 10002) {
        console.log('recvWindow error, retry...')
        return this.handleRecvError(request)
      }

      throw e
    })
  }

  // Rate Limit: 20 requests per 2 seconds
  // https://www.okx.com/docs-v5/en/#public-data-rest-api-get-instruments

  private instrumentsLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 1000 * 2,
    name: 'okx'
  })

  getInstrumentsInfo(instType: 'SPOT' | 'SWAP') {
    return this.instrumentsLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v5/public/instruments', { instType })
    })
  }

  // Rate Limit: 5 requests per 2 seconds
  // https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-fee-rates

  private ratesLimiter = new FrequencyLimiter({
    limit: 1,
    interval: 1250,
    threshold: 0,
    name: 'okx'
  })

  getFee(params: OKXRequests.TradeFee) {
    return this.ratesLimiter.wrap(1, () => {
      return this.signRequest<Response<OKXResponses.Fee[]>>('GET', '/api/v5/account/trade-fee', params)
    })
  }

  // 20 requests per 2 seconds
  // https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-candlesticks-history

  private candleLimiter = new FrequencyLimiter({
    limit: 20 - 5,
    interval: 1000 * 2,
    name: 'okx'
  })

  getChart(params: OKXRequests.Candles): Promise<Candle[]> {
    return this.candleLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v5/market/history-candles', params).then(({ data }) => {
        return data.map(([time, open, high, low, close, volume, , quoteVolume]) => {
          return {
            time: +time,
            open: +open,
            high: +high,
            low: +low,
            close: +close,
            volume: +volume,
            quoteVolume: +quoteVolume
          }
        })
      })
    })
  }
}
