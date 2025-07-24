import { Exchange } from '../../types'
import { OKXApi } from './api'
import { createOKXChartApi } from './chart'
import { createOKXFees } from './fees'
import { createOKXStream } from './stream'
import { createOKXSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
  passPhrase: string
}

export const createOKXExchange = (options: Options): Exchange => {
  const api = new OKXApi(options)

  return {
    name: 'okx',
    getChart: createOKXChartApi(api),
    getFees: createOKXFees(api),
    getSymbols: createOKXSymbols(api),
    createStream: createOKXStream()
  }
}
