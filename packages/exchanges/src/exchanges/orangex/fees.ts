import { multiply } from '@troovi/utils-js'
import { Fee, FeesApi } from '../../types'
import { OrangeXApi } from './api'

export const createOrangeXFees = (api: OrangeXApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      const { result: data } = await api.getInstrumentsInfo()

      const fees: Fee[] = []

      data.forEach(({ currency, show_name, taker_commission, maker_commission }) => {
        if (currency === 'SPOT' && symbols.includes(show_name)) {
          fees.push({
            symbol: show_name,
            takerCommission: multiply(+taker_commission, 100),
            makerCommission: multiply(+maker_commission, 100)
          })
        }
      })

      return fees
    }

    if (market === 'futures') {
      const { result: data } = await api.getInstrumentsInfo()

      const fees: Fee[] = []

      data.forEach(({ currency, show_name, taker_commission, maker_commission }) => {
        if (currency === 'PERPETUAL' && symbols.includes(show_name)) {
          fees.push({
            symbol: show_name,
            takerCommission: multiply(+taker_commission, 100),
            makerCommission: multiply(+maker_commission, 100)
          })
        }
      })

      return fees
    }

    return []
  }
}
