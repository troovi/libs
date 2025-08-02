import { multiply } from '@troovi/utils-js'
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
          takerCommission: multiply(+data.takerFeeRate, 100),
          makerCommission: multiply(+data.makerFeeRate, 100)
        }
      })
    )
  }
}
