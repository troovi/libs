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
          takerCommission: +data.taker_rate,
          makerCommission: +data.maker_rate
        }
      })
    )
  }
}
