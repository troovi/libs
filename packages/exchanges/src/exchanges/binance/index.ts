import { Exchange } from '../../types'
import { BinanceFuturesApi } from './api/futures/api'
import { BinanceSpotApi } from './api/spot/api'
import { createBinanceChartApi } from './chart'
import { createBinanceFees } from './fees'
import { createBinanceStream } from './stream'
import { createBinanceSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createBinanceExchange = (options: Options): Exchange => {
  const sapi = new BinanceSpotApi(options)
  const fapi = new BinanceFuturesApi(options)

  return {
    name: 'binance',
    getChart: createBinanceChartApi(sapi, fapi),
    getFees: createBinanceFees(sapi, fapi),
    getSymbols: createBinanceSymbols(sapi, fapi),
    createStream: createBinanceStream(sapi, fapi)
  }
}
