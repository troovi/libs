import { multiply } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { BitmartFuturesApi } from './api/futures/api'
import { BitmartSpotApi } from './api/spot/api'

export const createBitmartFees = (sapi: BitmartSpotApi, fapi: BitmartFuturesApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await sapi.getFee(symbol)

          return {
            symbol: data.symbol,
            takerCommission: multiply(
              Math.max(+data.buy_taker_fee_rate, +data.sell_taker_fee_rate),
              100
            ),
            makerCommission: multiply(
              Math.max(+data.buy_maker_fee_rate, +data.sell_maker_fee_rate),
              100
            )
          }
        })
      )
    }

    if (market === 'futures') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await fapi.getFee(symbol)

          return {
            symbol: data.symbol,
            takerCommission: multiply(+data.taker_fee_rate, 100),
            makerCommission: multiply(+data.maker_fee_rate, 100)
          }
        })
      )
    }

    return []
  }
}
