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
            takerCommission: +data.taker_fee,
            makerCommission: +data.maker_fee
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
            takerCommission: +data.futures_taker_fee,
            makerCommission: +data.futures_maker_fee
          }
        })
      )
    }

    return []
  }
}
