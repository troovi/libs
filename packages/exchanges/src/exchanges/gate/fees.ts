import { multiply } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { GateApi } from './api'

export const createGateFees = (api: GateApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const data = await api.getFees({ settle: 'USDT' })

          return {
            symbol,
            takerCommission: multiply(+data.taker_fee, 100),
            makerCommission: multiply(+data.maker_fee, 100)
          }
        })
      )
    }

    if (market === 'futures') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const data = await api.getFees({ settle: 'USDT' })

          return {
            symbol,
            takerCommission: multiply(+data.futures_taker_fee, 100),
            makerCommission: multiply(+data.futures_maker_fee, 100)
          }
        })
      )
    }

    return []
  }
}
