import { Exchange } from '../../types'
import { GateApi } from './api'
import { createGateChartApi } from './chart'
import { createGateFees } from './fees'
import { createGateStream } from './stream'
import { createGateSymbols } from './symbols'

interface Options {
  apiKey: string
  apiSecret: string
}

export const createGateExchange = (options: Options): Exchange => {
  const api = new GateApi(options)

  return {
    name: 'gate',
    getChart: createGateChartApi(api),
    getFees: createGateFees(api),
    getSymbols: createGateSymbols(api),
    createStream: createGateStream(api)
  }
}
