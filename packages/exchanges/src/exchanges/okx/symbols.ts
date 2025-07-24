import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { OKXApi } from './api'

export const createOKXSymbols = (api: OKXApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const { data: symbols } = await api.getInstrumentsInfo('SPOT')

      const data = symbols.filter(({ quoteCcy, ruleType, state }) => {
        return quoteCcy === 'USDT' && ruleType === 'normal' && state === 'live'
      })

      return data.map((asset) => {
        return {
          chartId: asset.instId,
          bookId: asset.instId,
          symbol: asset.instId,
          baseAsset: asset.baseCcy,
          quoteAsset: asset.quoteCcy,
          filters: {
            priceStep: +asset.tickSz,
            lotStep: +asset.lotSz,
            minQty: +asset.minSz,
            maxQty: +asset.maxLmtSz,
            minAmount: +asset.minSz,
            priceFactor: getCoinFactor(asset.instId)
          }
        }
      })
    }

    if (market === 'futures') {
      const { data: symbols } = await api.getInstrumentsInfo('SWAP')

      const data = symbols.filter(({ settleCcy, ruleType, state, ctType }) => {
        return settleCcy === 'USDT' && ruleType === 'normal' && state === 'live' && ctType === 'linear'
      })

      return data.map((asset) => {
        return {
          chartId: asset.instId,
          bookId: asset.instId,
          symbol: asset.uly,
          baseAsset: asset.ctValCcy,
          quoteAsset: asset.settleCcy,
          filters: {
            priceStep: +asset.tickSz,
            lotStep: +asset.lotSz,
            minQty: +asset.minSz,
            maxQty: +asset.maxLmtSz,
            minAmount: +asset.minSz,
            priceFactor: getCoinFactor(asset.uly)
          }
        }
      })
    }

    return []
  }
}
