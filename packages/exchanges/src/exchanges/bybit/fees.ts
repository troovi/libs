import { multiply } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { ByBitApi } from './api/api'

// todo: потенциальная ошибка при:
//
// {
//   retCode: 33004,
//   retMsg: 'Your api key has expired.',
//   result: {},
//   retExtInfo: {},
//   time: 1754062244466
// }

export const createByBitFees = (api: ByBitApi): FeesApi => {
  return async (market) => {
    return await api.handleRecvError(() => {
      return api.getFeeRate({ category: market === 'spot' ? 'spot' : 'linear' }).then(({ result }) => {
        return result.list.map(({ symbol, takerFeeRate, makerFeeRate }) => ({
          symbol,
          takerCommission: multiply(+takerFeeRate, 100),
          makerCommission: multiply(+makerFeeRate, 100)
        }))
      })
    })
  }
}
