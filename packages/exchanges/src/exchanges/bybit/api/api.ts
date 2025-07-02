import { AxiosError } from 'axios'
import { sortObject } from '../../../utils'
import { ApiClient } from '../../../api'
import { APIResponseV3WithTime, CategorySymbolListV5, ByBitDefenitions } from './types'
import { GetFeeRateParamsV5 } from './types.v5-account-request'
import { FeeRateV5 } from './types.v5-account-response'
import { CoinInfoV5 } from './types.v5-asset-response'
import { GetInstrumentsInfoParamsV5, GetKlineParamsV5 } from './types.v5-market-request'
import {
  CategoryCursorListV5,
  InstrumentInfoResponseV5,
  OHLCVKlineV5
} from './types.v5-market-response'
import { Candle } from '@troovi/chart'
import { getHexSignature } from '../../../crypto'

interface Options {
  apiKey: string
  apiSecret: string
}

interface APIs {
  '/v5/asset/coin/query-info': {
    params: { coin?: string }
    answer: { rows: CoinInfoV5[] }
  }
  '/v5/market/kline': {
    params: GetKlineParamsV5
    answer: APIResponseV3WithTime<CategorySymbolListV5<OHLCVKlineV5[], 'spot' | 'linear' | 'inverse'>>
  }
}

export class ByBitApi extends ApiClient<APIs> {
  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.bybit.com`, {
      name: 'bybit',
      authStrategy: (method, url, options) => {
        const query = new URLSearchParams(sortObject(options))
        const timestamp = (Date.now() - 200).toString()
        const recvWindow = 6000

        const prehash = [timestamp, apiKey, recvWindow, query.toString()].join('')

        return {
          method,
          url: `${url}?${query.toString()}`,
          headers: {
            'X-BAPI-SIGN': getHexSignature(apiSecret, prehash),
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow
          }
        }
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

  // prettier-ignore
  getInstrumentsInfo<C extends ByBitDefenitions.CategoryV5>(params: GetInstrumentsInfoParamsV5 & { category: C; }) {
    return this.request<APIResponseV3WithTime<InstrumentInfoResponseV5<C>>>({ url: '/v5/market/instruments-info', method: 'GET', params })
  }

  getCoinInfo(coin?: string) {
    return this.apiRequest('GET', '/v5/asset/coin/query-info', { coin })
  }

  // prettier-ignore
  getFeeRate(params: GetFeeRateParamsV5) {
    return this.signRequest<APIResponseV3WithTime<CategoryCursorListV5<FeeRateV5[]>>>('GET', '/v5/account/fee-rate', params)
  }

  // https://bybit-exchange.github.io/docs/v5/market/kline
  getKlines(params: GetKlineParamsV5): Promise<Candle[]> {
    return this.apiRequest('GET', '/v5/market/kline', params).then(({ result }) => {
      return result.list.map(([time, open, high, low, close, volume, quoteVolume]) => ({
        time: +time,
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
