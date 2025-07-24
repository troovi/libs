import { Exchange } from '../../types'
import { KuCoinFuturesApi } from './api/futures/api'
import { KuCoinSpotApi } from './api/spot/api'
import { createKuCoinChartApi } from './chart'
import { createKuCoinFees } from './fees'
import { createKuCoinStream } from './stream'
import { createKuCoinSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
  apiPassword: string
}

export const createKuCoinExchange = (options: Options): Exchange => {
  const sapi = new KuCoinSpotApi(options)
  const fapi = new KuCoinFuturesApi(options)

  return {
    name: 'kucoin',
    getChart: createKuCoinChartApi(sapi, fapi),
    getFees: createKuCoinFees(sapi, fapi),
    getSymbols: createKuCoinSymbols(sapi, fapi),
    createStream: createKuCoinStream(sapi, fapi)
  }
}
