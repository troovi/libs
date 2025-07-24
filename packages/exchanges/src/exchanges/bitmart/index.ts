import { Exchange } from '../../types'
import { BitmartFuturesApi } from './api/futures/api'
import { BitmartSpotApi } from './api/spot/api'
import { createBitmartChartApi } from './chart'
import { createBitmartFees } from './fees'
import { createBitmartStream } from './stream'
import { createBitmartSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createBitmartExchange = (options: Options): Exchange => {
  const sapi = new BitmartSpotApi(options)
  const fapi = new BitmartFuturesApi(options)

  return {
    name: 'bitmart',
    getChart: createBitmartChartApi(sapi, fapi),
    getFees: createBitmartFees(sapi, fapi),
    getSymbols: createBitmartSymbols(sapi, fapi),
    createStream: createBitmartStream()
  }
}
