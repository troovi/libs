import { getCoinFactor } from '../../utils'
import { Filters, SymbolApi } from '../../types'
import { BinanceFuturesApi } from './api/futures/api'
import { FuturesSymbolFilter, FuturesSymbolMinNotionalFilter } from './api/futures/types'
import { BinanceSpotApi } from './api/spot/api'
import {
  SymbolFilter,
  SymbolLotSizeFilter,
  SymbolMinNotionalFilter,
  SymbolPriceFilter
} from './api/spot/types'

export const createBinanceSymbols = (sapi: BinanceSpotApi, fapi: BinanceFuturesApi): SymbolApi => {
  return async (market) => {
    if (market === 'spot') {
      const { symbols } = await sapi.getExchangeInfo()

      const data = symbols.filter(({ status, quoteAsset }) => {
        return quoteAsset === 'USDT' && status === 'TRADING'
      })

      return data.map(({ symbol, baseAsset, quoteAsset, filters }) => ({
        chartId: symbol,
        bookId: symbol,
        symbol: symbol,
        baseAsset: baseAsset,
        quoteAsset: quoteAsset,
        filters: getSpotFilters(symbol, filters)
      }))
    }

    if (market === 'futures') {
      const { symbols } = await fapi.getExchangeInfo()

      const data = symbols.filter(({ quoteAsset, contractType, status }) => {
        return quoteAsset === 'USDT' && contractType === 'PERPETUAL' && status === 'TRADING'
      })

      return data.map(({ symbol, baseAsset, quoteAsset, filters }) => ({
        chartId: symbol,
        bookId: symbol,
        symbol: symbol,
        baseAsset: baseAsset,
        quoteAsset: quoteAsset,
        filters: getFuturesFilters(symbol, filters)
      }))
    }

    return []
  }
}

const getSpotFilters = (symbol: string, filters: SymbolFilter[]): Filters => {
  const getFilter = <T>(type: SymbolFilter['filterType']) => {
    return filters.find((f) => f.filterType === type) as T | undefined
  }

  // data.symbol

  const NOTIONAL = getFilter<SymbolMinNotionalFilter>('NOTIONAL')
  const PRICE_FILTER = getFilter<SymbolPriceFilter>('PRICE_FILTER')
  const LOT_SIZE = getFilter<SymbolLotSizeFilter>('LOT_SIZE')

  if (!PRICE_FILTER || !LOT_SIZE || !NOTIONAL) {
    throw 'Filters is invalid'
  }

  return {
    priceStep: +PRICE_FILTER.tickSize,
    minQty: +LOT_SIZE.minQty,
    maxQty: +LOT_SIZE.maxQty,
    lotStep: +LOT_SIZE.stepSize,
    minAmount: +NOTIONAL.minNotional,
    priceFactor: getCoinFactor(symbol)
  }
}

const getFuturesFilters = (symbol: string, filters: FuturesSymbolFilter[]): Filters => {
  const getFilter = <T>(type: FuturesSymbolFilter['filterType']) => {
    return filters.find((f) => f.filterType === type) as T | undefined
  }

  const NOTIONAL = getFilter<FuturesSymbolMinNotionalFilter>('MIN_NOTIONAL')
  const PRICE_FILTER = getFilter<SymbolPriceFilter>('PRICE_FILTER')
  const LOT_SIZE = getFilter<SymbolLotSizeFilter>('LOT_SIZE')

  if (!PRICE_FILTER || !LOT_SIZE || !NOTIONAL) {
    throw `Binance ${symbol} filters is invalid`
  }

  return {
    priceStep: +PRICE_FILTER.tickSize,
    minQty: +LOT_SIZE.minQty,
    maxQty: +LOT_SIZE.maxQty,
    lotStep: +LOT_SIZE.stepSize,
    minAmount: +NOTIONAL.notional,
    priceFactor: getCoinFactor(symbol)
  }
}
