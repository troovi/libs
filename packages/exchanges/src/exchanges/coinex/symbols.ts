import { SymbolApi } from '../../types'
import { getCoinFactor } from '../../utils'
import { CoinExApi } from './api'
import { getPrecisionStep } from '@troovi/utils-js'

export const createCoinExSymbols = (api: CoinExApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const symbols = await api.getSpotMarkets()

      const data = symbols.filter(({ quote_ccy, status }) => {
        return status === 'online' && quote_ccy === 'USDT'
      })

      return data.map((asset) => {
        return {
          chartId: asset.market,
          bookId: asset.market,
          symbol: asset.market,
          baseAsset: asset.base_ccy,
          quoteAsset: asset.quote_ccy,
          filters: {
            priceStep: +getPrecisionStep(+asset.quote_ccy_precision),
            minQty: +getPrecisionStep(+asset.base_ccy_precision),
            maxQty: Number.MAX_VALUE,
            lotStep: +getPrecisionStep(+asset.base_ccy_precision),
            minAmount: +asset.min_amount,
            priceFactor: getCoinFactor(asset.market)
          }
        }
      })
    }

    if (market === 'futures') {
      const symbols = await api.getFuturesMarkets()

      const data = symbols.filter(({ contract_type, status, quote_ccy }) => {
        return contract_type === 'linear' && quote_ccy === 'USDT' && status === 'online'
      })

      return data.map((asset) => {
        return {
          chartId: asset.market,
          bookId: asset.market,
          symbol: asset.market,
          baseAsset: asset.base_ccy,
          quoteAsset: asset.quote_ccy,
          filters: {
            priceStep: +asset.tick_size,
            minQty: +getPrecisionStep(+asset.base_ccy_precision),
            maxQty: Number.MAX_VALUE,
            lotStep: +getPrecisionStep(+asset.base_ccy_precision),
            minAmount: +asset.min_amount,
            priceFactor: getCoinFactor(asset.market)
          }
        }
      })
    }

    return []
  }
}
