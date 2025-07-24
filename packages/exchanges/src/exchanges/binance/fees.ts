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
          takerCommission: +takerCommission,
          makerCommission: +makerCommission
        }
      })
    }

    if (market === 'futures') {
      return Promise.all(
        symbols.map(async (symbol) => {
          const rate = await fapi.getTradeFee({ symbol })

          return {
            symbol: rate.symbol,
            takerCommission: +rate.takerCommissionRate,
            makerCommission: +rate.makerCommissionRate
          }
        })
      )
    }

    return []
  }
}
