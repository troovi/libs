import { multiply } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { BinanceFuturesApi } from './api/futures/api'
import { BinanceSpotApi } from './api/spot/api'

export const createBinanceFees = (sapi: BinanceSpotApi, fapi: BinanceFuturesApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      const rates = await sapi.handleRecvError(() => sapi.getTradeFee())

      return rates.map(({ symbol, takerCommission, makerCommission }) => {
        return {
          symbol,
          takerCommission: multiply(+takerCommission, 100),
          makerCommission: multiply(+makerCommission, 100)
        }
      })
    }

    if (market === 'futures') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const rate = await fapi.getTradeFee({ symbol })

          return {
            symbol: rate.symbol,
            takerCommission: multiply(+rate.takerCommissionRate, 100),
            makerCommission: multiply(+rate.makerCommissionRate, 100)
          }
        })
      )
    }

    return []
  }
}
