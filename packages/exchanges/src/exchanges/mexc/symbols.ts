import { getPrecisionStep } from '@troovi/utils-js'
import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { MexcFuturesApi } from './api/futures/api'
import { MexcSpotApi } from './api/spot/api'

export const createMexcSymbols = (sapi: MexcSpotApi, fapi: MexcFuturesApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const symbols = await sapi.getSymbols()

      const data = symbols.filter(({ status, tradeSideType, quoteAsset }) => {
        return status === '1' && tradeSideType === 1 && quoteAsset === 'USDT'
      })

      return data.map((asset) => {
        const lotStep = +getPrecisionStep(asset.baseAssetPrecision)

        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseAsset,
          quoteAsset: asset.quoteAsset,
          filters: {
            priceStep: +getPrecisionStep(asset.quoteAssetPrecision),
            minQty: lotStep,
            maxQty: Number.MAX_VALUE,
            lotStep,
            minAmount: Math.max(+asset.quoteAmountPrecision, +asset.quoteAmountPrecisionMarket),
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    if (market === 'futures') {
      const symbols = await fapi.getSymbols()

      const data = symbols.filter(({ displayNameEn, quoteCoinName }) => {
        return displayNameEn.includes('PERPETUAL') && quoteCoinName === 'USDT'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.baseCoin,
          quoteAsset: asset.quoteCoin,
          filters: {
            priceStep: +asset.priceUnit,
            minQty: +asset.minVol,
            maxQty: +asset.maxVol,
            lotStep: +asset.volUnit,
            minAmount: 0,
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    return []
  }
}
