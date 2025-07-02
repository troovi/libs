export namespace MexcDefinitions {
  export type OrderType = 'LIMIT' | 'MARKET' | 'LIMIT_MAKER' | 'IMMEDIATE_OR_CANCEL' | 'FILL_OR_KILL'
  export type OrderSide = 'BUY' | 'SELL'
  export type OrderStatus = 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELED' | 'PARTIALLY_CANCELED'
}
