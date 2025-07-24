import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { ByBitApi } from './api/api'

export const createByBitSymbols = (api: ByBitApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const { result } = await api.getInstrumentsInfo({
        category: 'spot',
        status: 'Trading',
        limit: 1000
      })

      const data = result.list.filter(({ quoteCoin, status }) => {
        return quoteCoin === 'USDT' && status === 'Trading'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCoin,
          quoteAsset: asset.quoteCoin,
          filters: {
            priceStep: +asset.priceFilter.tickSize,
            minQty: +asset.lotSizeFilter.minOrderQty,
            maxQty: +asset.lotSizeFilter.maxOrderQty,
            lotStep: +asset.lotSizeFilter.basePrecision,
            minAmount: +asset.lotSizeFilter.minOrderAmt,
            priceFactor: getCoinFactor(
              (() => {
                if (asset.symbol.endsWith('1000USDT')) {
                  return 1000 + asset.symbol
                }

                return asset.symbol
              })()
            )
          }
        }
      })
    }

    if (market === 'futures') {
      const { result } = await api.getInstrumentsInfo({
        category: 'linear',
        limit: 1000,
        status: 'Trading'
      })

      const data = result.list.filter(({ quoteCoin, contractType, status }) => {
        return quoteCoin === 'USDT' && contractType === 'LinearPerpetual' && status === 'Trading'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCoin,
          quoteAsset: asset.quoteCoin,
          filters: {
            priceStep: +asset.priceFilter.tickSize,
            minQty: +asset.lotSizeFilter.minOrderQty,
            maxQty: +asset.lotSizeFilter.maxOrderQty,
            lotStep: +asset.lotSizeFilter.qtyStep,
            minAmount: +(asset.lotSizeFilter.minNotionalValue ?? 1),
            priceFactor: getCoinFactor(
              (() => {
                if (asset.symbol.endsWith('1000USDT')) {
                  return 1000 + asset.symbol
                }

                return asset.symbol
              })()
            )
          }
        }
      })
    }

    return []
  }
}
