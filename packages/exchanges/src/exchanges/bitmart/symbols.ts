import { getPrecisionStep } from '@troovi/utils-js'
import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { BitmartSpotApi } from './api/spot/api'
import { BitmartFuturesApi } from './api/futures/api'

export const createBitmartSymbols = (sapi: BitmartSpotApi, fapi: BitmartFuturesApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const { symbols } = await sapi.getSymbols()

      const data = symbols.filter(({ trade_status, quote_currency, expiration }) => {
        return trade_status === 'trading' && quote_currency === 'USDT' && expiration === 'NA'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.base_currency,
          quoteAsset: asset.quote_currency,
          filters: {
            priceStep: +getPrecisionStep(+asset.price_max_precision),
            minQty: +asset.base_min_size,
            maxQty: Number.MAX_VALUE,
            lotStep: +asset.quote_increment,
            minAmount: +asset.min_buy_amount,
            priceFactor: getCoinFactor(asset.symbol)
          }
        }
      })
    }

    if (market === 'futures') {
      const { symbols } = await fapi.getContracts()

      const data = symbols.filter(({ product_type, quote_currency, status }) => {
        return product_type === 1 && quote_currency === 'USDT' && status === 'Trading'
      })

      return data.map((asset) => {
        return {
          chartId: asset.symbol,
          bookId: asset.symbol,
          symbol: asset.symbol,
          baseAsset: asset.base_currency,
          quoteAsset: asset.quote_currency,
          filters: {
            priceStep: +asset.price_precision,
            minQty: +asset.vol_precision,
            maxQty: +asset.max_volume,
            lotStep: +asset.min_volume,
            priceFactor: getCoinFactor(asset.symbol),
            minAmount: 0
          }
        }
      })
    }

    return []
  }
}
