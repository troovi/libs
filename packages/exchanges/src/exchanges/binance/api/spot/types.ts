// utilities types
export namespace BinanceDefinitions {
  export type OrderSide = 'BUY' | 'SELL'
  // prettier-ignore
  export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED'
  export type OrderTimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX' | 'GTE_GTC' | 'GTD'
  // prettier-ignore
  export type OrderType = 'LIMIT' | 'LIMIT_MAKER' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT'
  //
  export type SelfTradePreventionMode = 'EXPIRE_TAKER' | 'EXPIRE_MAKER' | 'EXPIRE_BOTH' | 'NONE'

  export type ContactType =
    | 'PERPETUAL'
    | 'CURRENT_MONTH'
    | 'NEXT_MONTH'
    | 'CURRENT_QUARTER'
    | 'NEXT_QUARTER'

  export type ContractStatus =
    | 'PENDING_TRADING'
    | 'TRADING'
    | 'PRE_DELIVERING'
    | 'DELIVERING'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'PRE_SETTLE'
    | 'SETTLING'
    | 'CLOSE'
}

export interface SymbolPriceFilter {
  filterType: 'PRICE_FILTER'
  minPrice: string
  maxPrice: string
  tickSize: string
}
export interface SymbolPercentPriceFilter {
  filterType: 'PERCENT_PRICE'
  multiplierUp: string
  multiplierDown: string
  avgPriceMins: number
}
export interface SymbolLotSizeFilter {
  filterType: 'LOT_SIZE'
  minQty: string
  maxQty: string
  stepSize: string
}
export interface SymbolMinNotionalFilter {
  filterType: 'NOTIONAL'
  minNotional: string
  applyMinToMarket: boolean
  maxNotional: string
  applyMaxToMarket: boolean
  avgPriceMins: number
}
export interface SymbolIcebergPartsFilter {
  filterType: 'ICEBERG_PARTS'
  limit: number
}
export interface SymbolMarketLotSizeFilter {
  filterType: 'MARKET_LOT_SIZE'
  minQty: string
  maxQty: string
  stepSize: string
}
export interface SymbolMaxOrdersFilter {
  filterType: 'MAX_NUM_ORDERS'
  maxNumOrders: number
}
export interface SymbolMaxAlgoOrdersFilter {
  filterType: 'MAX_NUM_ALGO_ORDERS'
  maxNumAlgoOrders: number
}
export interface SymbolMaxIcebergOrdersFilter {
  filterType: 'MAX_NUM_ICEBERG_ORDERS'
  maxNumIcebergOrders: number
}
export interface SymbolMaxPositionFilter {
  filterType: 'MAX_POSITION'
  maxPosition: string
}
export type SymbolFilter =
  | SymbolPriceFilter
  | SymbolPercentPriceFilter
  | SymbolLotSizeFilter
  | SymbolMinNotionalFilter
  | SymbolIcebergPartsFilter
  | SymbolMarketLotSizeFilter
  | SymbolMaxOrdersFilter
  | SymbolMaxAlgoOrdersFilter
  | SymbolMaxIcebergOrdersFilter
  | SymbolMaxPositionFilter

export interface SymbolExchangeInfo {
  symbol: string
  status: string
  baseAsset: string
  baseAssetPrecision: number
  quoteAsset: string
  quotePrecision: number
  quoteAssetPrecision: number
  baseCommissionPrecision: number
  quoteCommissionPrecision: number
  orderTypes: BinanceDefinitions.OrderType[]
  icebergAllowed: boolean
  ocoAllowed: boolean
  quoteOrderQtyMarketAllowed: boolean
  allowTrailingStop: boolean
  cancelReplaceAllowed: boolean
  isSpotTradingAllowed: boolean
  isMarginTradingAllowed: boolean
  filters: SymbolFilter[]
  permissions: ('SPOT' | 'MARGIN')[]
  permissionSets: string[]
  defaultSelfTradePreventionMode: BinanceDefinitions.SelfTradePreventionMode
  allowedSelfTradePreventionModes: BinanceDefinitions.SelfTradePreventionMode[]
}

export interface CoinNetwork {
  addressRegex: string
  coin: string
  depositDesc: string
  depositEnable: boolean
  isDefault: boolean
  memoRegex: string
  minConfirm: number
  name: string
  network: string
  resetAddressStatus: boolean
  specialTips?: string
  specialWithdrawTips?: string
  unlockConfirm: number
  withdrawDesc: string
  withdrawEnable: boolean
  withdrawFee: string
  withdrawMin: string
  withdrawMax: string
  withdrawInternalMin: string
  withdrawIntegerMultiple: string
  depositDust?: string
  sameAddress: boolean
  estimatedArrivalTime: number
  busy: boolean
  contractAddressUrl?: string
  contractAddress?: string
}

export interface RateLimiter {
  rateLimitType: 'REQUEST_WEIGHT' | 'ORDERS' | 'RAW_REQUESTS'
  interval: 'SECOND' | 'MINUTE' | 'DAY'
  intervalNum: number
  limit: number
}

export interface ExchangeMaxNumOrdersFilter {
  filterType: 'EXCHANGE_MAX_NUM_ORDERS'
  maxNumOrders: number
}
export interface ExchangeMaxAlgoOrdersFilter {
  filterType: 'EXCHANGE_MAX_ALGO_ORDERS'
  maxNumAlgoOrders: number
}
export type ExchangeFilter = ExchangeMaxNumOrdersFilter | ExchangeMaxAlgoOrdersFilter
