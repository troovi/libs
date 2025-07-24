import { getFloatDigits, getPrecisionStep } from '@troovi/utils-js'
import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { OrangeXApi } from './api'

export const createOrangeXSymbols = (api: OrangeXApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const { result: symbols } = await api.getInstrumentsInfo()

      const data = symbols.filter(({ currency, is_active, base_currency }) => {
        return currency === 'SPOT' && is_active && base_currency === 'USDT'
      })

      return data.map((asset) => {
        return {
          chartId: `${asset.quote_currency}-${asset.base_currency}`,
          bookId: `${asset.quote_currency}-${asset.base_currency}`,
          symbol: asset.show_name,
          baseAsset: asset.quote_currency,
          quoteAsset: asset.base_currency,
          filters: {
            priceStep: +asset.tick_size,
            lotStep: +getPrecisionStep(getFloatDigits(asset.min_qty)),
            minQty: +asset.min_qty,
            maxQty: Number.MAX_VALUE,
            minAmount: +asset.min_notional,
            priceFactor: getCoinFactor(asset.show_name)
          }
        }
      })
    }

    if (market === 'futures') {
      const { result: symbols } = await api.getInstrumentsInfo()

      const data = symbols.filter(({ currency, is_active, base_currency }) => {
        return currency === 'PERPETUAL' && is_active && base_currency === 'USDT'
      })

      return data.map((asset) => {
        return {
          chartId: asset.instrument_name,
          bookId: asset.instrument_name,
          symbol: asset.show_name,
          baseAsset: asset.quote_currency,
          quoteAsset: asset.base_currency,
          filters: {
            priceStep: +asset.tick_size,
            lotStep: +getPrecisionStep(getFloatDigits(asset.min_qty)),
            minQty: +asset.min_qty,
            maxQty: Number.MAX_VALUE,
            minAmount: +asset.min_notional,
            priceFactor: getCoinFactor(asset.show_name)
          }
        }
      })
    }

    return []
  }
}
