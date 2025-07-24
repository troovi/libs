import { Exchange } from '../../types'
import { BitgetApi } from './api/api'
import { createBitgetChartApi } from './chart'
import { createBitgetFees } from './fees'
import { createBitgetStream } from './stream'
import { createBitgetSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
  passPhrase: string
}

export const createBitgetExchange = (options: Options): Exchange => {
  const api = new BitgetApi(options)

  return {
    name: 'bitget',
    getChart: createBitgetChartApi(api),
    getFees: createBitgetFees(api),
    getSymbols: createBitgetSymbols(api),
    createStream: createBitgetStream()
  }
}
