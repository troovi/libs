import { Exchange } from '../../types'
import { CoinExApi } from './api'
import { createCoinExChartApi } from './chart'
import { createCoinExFees } from './fees'
import { createCoinExStream } from './stream'
import { createCoinExSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createCoinExExchange = (options: Options): Exchange => {
  const api = new CoinExApi(options)

  return {
    name: 'coinex',
    getChart: createCoinExChartApi(api),
    getFees: createCoinExFees(api),
    getSymbols: createCoinExSymbols(api),
    createStream: createCoinExStream()
  }
}
