import { getPrecisionStep } from '@troovi/utils-js'
import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { BitgetApi } from './api/api'

export const createBitgetSymbols = (api: BitgetApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const { data: symbols } = await api.getSpotSymbols()

      const data = symbols.filter(({ quoteCoin, status }) => {
        return quoteCoin === 'USDT' && status === 'online'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCoin,
          quoteAsset: asset.quoteCoin,
          filters: {
            priceStep: +getPrecisionStep(+asset.pricePrecision),
            lotStep: +getPrecisionStep(+asset.quantityPrecision),
            minQty: 0,
            maxQty: Number.MAX_VALUE,
            minAmount: +asset.minTradeUSDT,
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    if (market === 'futures') {
      const { data: symbols } = await api.getContracts({ productType: 'usdt-futures' })

      const data = symbols.filter(({ quoteCoin, symbolStatus, symbolType }) => {
        return quoteCoin === 'USDT' && symbolStatus === 'normal' && symbolType === 'perpetual'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCoin,
          quoteAsset: asset.quoteCoin,
          filters: {
            priceStep: +getPrecisionStep(+asset.pricePlace),
            lotStep: +getPrecisionStep(+asset.volumePlace),
            minQty: +asset.minTradeNum,
            maxQty: Number.MAX_VALUE,
            minAmount: +asset.minTradeUSDT,
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    return []
  }
}
