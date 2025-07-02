export namespace ByBitDefenitions {
  export type CategoryV5 = 'spot' | 'linear' | 'inverse' | 'option'
  export type ContractTypeV5 = 'InversePerpetual' | 'LinearPerpetual' | 'InverseFutures'
  export type CopyTradingV5 = 'none' | 'both' | 'utaOnly' | 'normalOnly'
  export type InstrumentStatusV5 = 'PreLaunch' | 'Trading' | 'Settling' | 'Delivering' | 'Closed'
  export type MarginTradingV5 = 'none' | 'both' | 'utaOnly' | 'normalSpotOnly'
  export type OrderFilterV5 = 'Order' | 'tpslOrder' | 'StopOrder'
  export type OrderSideV5 = 'Buy' | 'Sell'
  export type OrderTypeV5 = 'Market' | 'Limit'
  export type OrderTimeInForceV5 = 'GTC' | 'IOC' | 'FOK' | 'PostOnly' | 'RPI'
  export type OrderTriggerByV5 = 'LastPrice' | 'IndexPrice' | 'MarkPrice'
  export type OCOTriggerTypeV5 = 'OcoTriggerByUnknown' | 'OcoTriggerTp' | 'OcoTriggerBySl'
  export type OrderSMPTypeV5 = 'None' | 'CancelMaker' | 'CancelTaker' | 'CancelBoth'
  export type OrderStatusV5 =
    | 'Created'
    | 'New'
    | 'Rejected'
    | 'PartiallyFilled'
    | 'PartiallyFilledCanceled'
    | 'Filled'
    | 'Cancelled'
    | 'Untriggered'
    | 'Triggered'
    | 'Deactivated'
    | 'Active'

  export type PositionStatusV5 = 'Normal' | 'Liq' | 'Adl'
  export type PositionSideV5 = 'Buy' | 'Sell' | 'None' | ''
  export type OptionTypeV5 = 'Call' | 'Put'

  export type TradeModeV5 = 0 | 1
  export type TPSLModeV5 = 'Full' | 'Partial'
  export type AccountMarginModeV5 = 'ISOLATED_MARGIN' | 'REGULAR_MARGIN' | 'PORTFOLIO_MARGIN'
  export type UnifiedUpdateStatusV5 = 'FAIL' | 'PROCESS' | 'SUCCESS'
  export type AccountTypeV5 = 'CONTRACT' | 'SPOT' | 'INVESTMENT' | 'OPTION' | 'UNIFIED' | 'FUND'
  export type TransactionTypeV5 =
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'TRADE'
    | 'SETTLEMENT'
    | 'DELIVERY'
    | 'LIQUIDATION'
    | 'BONUS'
    | 'FEE_REFUND'
    | 'INTEREST'
    | 'CURRENCY_BUY'
    | 'CURRENCY_SELL'
  export type PermissionTypeV5 =
    | 'ContractTrade'
    | 'Spot'
    | 'Wallet'
    | 'Options'
    | 'Derivatives'
    | 'Exchange'
    | 'NFT'
}

export type KlineIntervalV3 =
  | '1'
  | '3'
  | '5'
  | '15'
  | '30'
  | '60'
  | '120'
  | '240'
  | '360'
  | '720'
  | 'D'
  | 'W'
  | 'M'

export interface APIRateLimit {
  /** Remaining requests to this endpoint before the next reset */
  remainingRequests: number
  /** Max requests for this endpoint per rollowing window (before next reset) */
  maxRequests: number
  /**
   * Timestamp when the rate limit resets if you have exceeded your current maxRequests.
   * Otherwise, this is approximately your current timestamp.
   */
  resetAtTimestamp: number
}

export interface APIResponseV3<T> {
  retCode: number
  retMsg: 'OK' | string
  result: T
  /**
   * These are per-UID per-endpoint rate limits, automatically parsed from response headers if available.
   *
   * Note:
   * - this is primarily for V5 (or newer) APIs.
   * - these rate limits are per-endpoint per-account, so will not appear for public API calls
   */
  rateLimitApi?: APIRateLimit
}

export type APIResponseV3WithTime<T> = APIResponseV3<T> & {
  time: number
}

export interface CategorySymbolListV5<
  T extends unknown[],
  TCategory extends ByBitDefenitions.CategoryV5
> {
  category: TCategory
  symbol: string
  list: T
}
