import { FeesApi } from '../../types'
import { BitgetApi } from './api/api'

export const createBitgetFees = (api: BitgetApi): FeesApi => {
  return async (market, symbols) => {
    return Promise.all(
      symbols.map(async (symbol) => {
        const { data } = await api.handleRecvError(() => {
          return api.getFee({ symbol, businessType: market === 'futures' ? 'mix' : 'spot' })
        })

        return {
          symbol,
          takerCommission: +data.takerFeeRate,
          makerCommission: +data.makerFeeRate
        }
      })
    )
  }
}
