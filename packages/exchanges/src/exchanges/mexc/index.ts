import { Exchange } from '../../types'
import { MexcFuturesApi } from './api/futures/api'
import { MexcSpotApi } from './api/spot/api'
import { createMexcChartApi } from './chart'
import { createMexcFees } from './fees'
import { createMexcStream } from './stream'
import { createMexcSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createMexcExchange = (options: Options): Exchange => {
  const sapi = new MexcSpotApi(options)
  const fapi = new MexcFuturesApi(options)

  return {
    name: 'mexc',
    getChart: createMexcChartApi(sapi, fapi),
    getFees: createMexcFees(sapi, fapi),
    getSymbols: createMexcSymbols(sapi, fapi),
    createStream: createMexcStream(sapi, fapi)
  }
}
