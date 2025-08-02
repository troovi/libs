import { multiply, splitByChunks } from '@troovi/utils-js'
import { FeesApi } from '../../types'
import { KuCoinFuturesApi } from './api/futures/api'
import { KuCoinSpotApi } from './api/spot/api'

export const createKuCoinFees = (sapi: KuCoinSpotApi, fapi: KuCoinFuturesApi): FeesApi => {
  return async (market, symbols) => {
    if (market === 'spot') {
      const rates = await Promise.all(
        splitByChunks(symbols, 10).map(async (chunk) => {
          const { data } = await sapi.handleRecvError(() => sapi.getFees(chunk))
          return data
        })
      )

      const data = rates.reduce((prev, curr) => [...prev, ...curr], [])

      return data.map(({ symbol, makerFeeRate, takerFeeRate }) => ({
        symbol,
        takerCommission: multiply(+takerFeeRate, 100),
        makerCommission: multiply(+makerFeeRate, 100)
      }))
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
