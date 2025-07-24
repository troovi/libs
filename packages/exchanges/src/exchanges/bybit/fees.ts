import { FeesApi } from '../../types'
import { ByBitApi } from './api/api'

export const createByBitFees = (api: ByBitApi): FeesApi => {
  return async (market) => {
    return await api.handleRecvError(() => {
      return api.getFeeRate({ category: market === 'spot' ? 'spot' : 'linear' }).then(({ result }) => {
        return result.list.map(({ symbol, takerFeeRate, makerFeeRate }) => ({
          symbol,
          takerCommission: +takerFeeRate,
          makerCommission: +makerFeeRate
        }))
      })
    })
  }
}
