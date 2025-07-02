import {
  BinanceDefinitions,
  SymbolIcebergPartsFilter,
  SymbolLotSizeFilter,
  SymbolMarketLotSizeFilter,
  SymbolMaxIcebergOrdersFilter,
  SymbolMaxPositionFilter,
  SymbolPriceFilter
} from '../spot/types'

export interface FuturesSymbolPercentPriceFilter {
  filterType: 'PERCENT_PRICE'
  multiplierUp: string
  multiplierDown: string
  multiplierDecimal: string
}
export interface FuturesSymbolMaxOrdersFilter {
  filterType: 'MAX_NUM_ORDERS'
  limit: number
}
export interface FuturesSymbolMaxAlgoOrdersFilter {
  filterType: 'MAX_NUM_ALGO_ORDERS'
  limit: number
}
export interface FuturesSymbolMinNotionalFilter {
  filterType: 'MIN_NOTIONAL'
  notional: string
}
export type FuturesSymbolFilter =
  | SymbolPriceFilter
  | FuturesSymbolPercentPriceFilter
  | SymbolLotSizeFilter
  | FuturesSymbolMinNotionalFilter
  | SymbolIcebergPartsFilter
  | SymbolMarketLotSizeFilter
  | FuturesSymbolMaxOrdersFilter
  | FuturesSymbolMaxAlgoOrdersFilter
  | SymbolMaxIcebergOrdersFilter
  | SymbolMaxPositionFilter

export interface FuturesSymbolExchangeInfo {
  symbol: string
  pair: string
  contractType: BinanceDefinitions.ContactType
  deliveryDate: number
  onboardDate: number
  status: BinanceDefinitions.ContractStatus
  maintMarginPercent: string
  requiredMarginPercent: string
  baseAsset: string
  quoteAsset: string
  marginAsset: string
  pricePrecision: number
  quantityPrecision: number
  baseAssetPrecision: number
  quotePrecision: number
  underlyingType: 'COIN' | 'INDEX'
  underlyingSubType: string[]
  settlePlan: number
  triggerProtect: string
  filters: FuturesSymbolFilter[]
  OrderType: BinanceDefinitions.OrderType[]
  timeInForce: BinanceDefinitions.OrderTimeInForce[]
  liquidationFee: string
  marketTakeBound: string
  contractSize?: number
}

export interface AssetInforamtion {
  asset: string
  marginAvailable: boolean
  autoAssetExchange: number
}
