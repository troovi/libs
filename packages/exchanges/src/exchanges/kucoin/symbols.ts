import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { KuCoinSpotApi } from './api/spot/api'
import { KuCoinFuturesApi } from './api/futures/api'

export const createKuCoinSymbols = (sapi: KuCoinSpotApi, fapi: KuCoinFuturesApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const symbols = await sapi.getSymbols()

      const data = symbols.filter(({ enableTrading, quoteCurrency }) => {
        return enableTrading && quoteCurrency === 'USDT'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCurrency,
          quoteAsset: asset.quoteCurrency,
          filters: {
            priceStep: +asset.priceIncrement,
            minQty: +asset.baseMinSize,
            maxQty: +asset.baseMaxSize,
            lotStep: +asset.baseIncrement,
            minAmount: +asset.minFunds,
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    if (market === 'futures') {
      const symbols = await fapi.getSymbols()

      const data = symbols.filter(({ expireDate, quoteCurrency, status, isInverse }) => {
        return expireDate === null && quoteCurrency === 'USDT' && status === 'Open' && !isInverse
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCurrency,
          quoteAsset: asset.quoteCurrency,
          filters: {
            priceStep: +asset.tickSize,
            minQty: +asset.lotSize,
            maxQty: +asset.maxOrderQty,
            lotStep: +asset.lotSize,
            minAmount: 0,
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    return []
  }
}
