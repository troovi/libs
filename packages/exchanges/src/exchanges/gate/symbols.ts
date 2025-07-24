import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { GateApi } from './api'
import { getPrecisionStep } from '@troovi/utils-js'

export const createGateSymbols = (api: GateApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const symbols = await api.getSpotInstruments()

      const data = symbols.filter(({ type, trade_status, quote }) => {
        return type === 'normal' && trade_status === 'tradable' && quote === 'USDT'
      })

      return data.map((asset) => {
        return {
          chartId: asset.id,
          bookId: asset.id,
          symbol: asset.id,
          baseAsset: asset.base,
          quoteAsset: asset.quote,
          filters: {
            priceStep: +getPrecisionStep(asset.precision),
            minQty: +asset.min_base_amount,
            maxQty: Number.MAX_VALUE,
            lotStep: +getPrecisionStep(asset.amount_precision),
            minAmount: +asset.min_quote_amount,
            priceFactor: getCoinFactor(asset.id)
          }
        }
      })
    }

    if (market === 'futures') {
      const symbols = await api.getFuturesInstruments()

      const data = symbols.filter(({ is_pre_market, in_delisting, name, type }) => {
        return !is_pre_market && !in_delisting && name.split('_')[1] === 'USDT' && type === 'direct'
      })

      return data.map((asset) => {
        const [baseAsset, quoteAsset] = asset.name.split('_')

        return {
          chartId: asset.name,
          bookId: asset.name,
          symbol: asset.name,
          baseAsset,
          quoteAsset,
          filters: {
            priceStep: +asset.order_price_round,
            minQty: +asset.order_size_min,
            maxQty: +asset.order_size_max,
            lotStep: 0,
            minAmount: 0,
            priceFactor: getCoinFactor(
              (() => {
                if (asset.name === 'MBABYDOGE_USDT') {
                  return '1MBABYDOGE_USDT'
                }

                return asset.name
              })()
            )
          }
        }
      })
    }

    return []
  }
}
