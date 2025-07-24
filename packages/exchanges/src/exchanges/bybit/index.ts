import { Exchange } from '../../types'
import { ByBitApi } from './api/api'
import { createByBitChartApi } from './chart'
import { createByBitFees } from './fees'
import { createByBitStream } from './stream'
import { createByBitSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createByBitExchange = (options: Options): Exchange => {
  const api = new ByBitApi(options)

  return {
    name: 'bybit',
    getChart: createByBitChartApi(api),
    getFees: createByBitFees(api),
    getSymbols: createByBitSymbols(api),
    createStream: createByBitStream()
  }
}
