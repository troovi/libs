import { Exchange } from '../../types'
import { OrangeXApi } from './api'
import { createOrangeXChartApi } from './chart'
import { createOrangeXFees } from './fees'
import { createOrangeXStream } from './stream'
import { createOrangeXSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createOrangeXExchange = (options: Options): Exchange => {
  const api = new OrangeXApi(options)

  return {
    name: 'orangex',
    getChart: createOrangeXChartApi(api),
    getFees: createOrangeXFees(api),
    getSymbols: createOrangeXSymbols(api),
    createStream: createOrangeXStream(api)
  }
}
