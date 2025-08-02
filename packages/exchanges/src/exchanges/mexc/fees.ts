import { multiply } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { MexcHandlers } from './api/api-handlers'
import { MexcFuturesApi } from './api/futures/api'
import { MexcSpotApi } from './api/spot/api'

export const createMexcFees = (sapi: MexcSpotApi, fapi: MexcFuturesApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await MexcHandlers.handleRecvError(() => {
            return sapi.getSymbolCommission(symbol)
          })

          return {
            symbol,
            takerCommission: multiply(+data.takerCommission, 100),
            makerCommission: multiply(+data.makerCommission, 100)
          }
        })
      )
    }

    if (market === 'futures') {
      const data = await fapi.getSymbols()

      return data.map(({ symbol, takerFeeRate, makerFeeRate }) => ({
        symbol,
        takerCommission: multiply(takerFeeRate, 100),
        makerCommission: multiply(makerFeeRate, 100)
      }))
    }

    return []
  }
}
