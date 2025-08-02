import { multiply } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { CoinExApi } from './api'

export const createCoinExFees = (api: CoinExApi): FeesApi => {
  return async (market, symbols) => {
    return Promise.all(
      symbols.map(async (symbol) => {
        const { data } = await api.getFee({
          market: symbol,
          market_type: market === 'spot' ? 'SPOT' : 'FUTURES'
        })

        return {
          symbol,
          takerCommission: multiply(+data.taker_rate, 100),
          makerCommission: multiply(+data.maker_rate, 100)
        }
      })
    )
  }
}
