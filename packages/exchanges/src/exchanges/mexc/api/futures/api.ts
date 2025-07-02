import { Candle } from '@troovi/chart'
import { FrequencyLimiter } from '@troovi/utils-nodejs'
import { ApiClient } from '../../../../api'
import { FuturesDetail } from './types'
import { getHexSignature } from '../../../../crypto'

interface Response<T> {
  success: boolean
  code: number
  data: T
}

export namespace MexcFuturesRequests {
  export interface Detail {
    symbol?: string
  }

  export interface Kline {
    symbol: string
    interval?: 'Min1' | 'Min5'
    start?: number
    end?: number
  }
}

export namespace MexcFuturesResponses {
  export interface Kline {
    time: number[]
    open: number[]
    close: number[]
    high: number[]
    low: number[]
    vol: number[]
    amount: number[]
  }

  export interface Depth {
    version: number
    timestamp: number
    asks: [number, number, number][]
    bids: [number, number, number][]
  }
}

interface APIs {
  '/api/v1/contract/detail': {
    params: MexcFuturesRequests.Detail
    answer: Response<FuturesDetail[]>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class MexcFuturesApi extends ApiClient<APIs> {
  // Each endpoint with IP limits has an independent 500 every 10 second limit.

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://contract.mexc.com`, {
      name: 'mexc-futures',
      headers: {
        'Content-Type': 'application/json'
      },
      authStrategy: (method, url, options) => {
        const params = {
          ...options,
          timestamp: (Date.now() - 200).toString()
        }

        const query = new URLSearchParams(params)
        query.append('signature', getHexSignature(apiSecret, query.toString()))

        return { method, url: `${url}?${query.toString()}`, headers: { 'X-MEXC-APIKEY': apiKey } }
      }
    })
  }

  //  Rate limit: 1 times / 5 seconds

  private symbolLimiter = new FrequencyLimiter({ limit: 1, interval: 5 * 1000, name: 'mexc' })

  getSymbols(symbol?: string) {
    return this.symbolLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v1/contract/detail', { symbol }).then(({ data }) => data)
    })
  }

  //  Rate limit: 20 times /2 seconds
  // https://mexcdevelop.github.io/apidocs/contract_v1_en/?javascript#get-the-contract-s-depth-information

  private snapshotLimiter = new FrequencyLimiter({ limit: 15, interval: 2, name: 'mexc' })

  getSnapshot(symbol: string) {
    type R = Response<MexcFuturesResponses.Depth>

    return this.snapshotLimiter.wrap(1, () => {
      return this.request<R>({ method: 'GET', url: `/api/v1/contract/depth/${symbol}` }).then((R) => {
        return R.data
      })
    })
  }

  // Rate limit: 20 times / 2 seconds
  // https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data

  private klineLimiter = new FrequencyLimiter({ limit: 20, interval: 2, name: 'mexc' })

  getChart({ symbol, ...params }: MexcFuturesRequests.Kline): Promise<Candle[]> {
    type R = Response<MexcFuturesResponses.Kline>

    return this.klineLimiter.wrap(1, () => {
      return this.request<R>({ method: 'GET', url: `/api/v1/contract/kline/${symbol}`, params }).then(
        ({ data }) => {
          return data.time.map((time, i) => {
            return {
              time: time * 1000,
              high: data.high[i],
              close: data.close[i],
              low: data.low[i],
              open: data.open[i],
              volume: data.vol[i],
              quoteVolume: data.amount[i]
            }
          })
        }
      )
    })
  }
}
