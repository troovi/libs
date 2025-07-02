export namespace MexcSecureResponses {
  export interface Account {
    channel: 'spot@private.account.v3.api.pb'
    createTime: string
    sendTime: string
    privateAccount: {
      vcoinName: string
      coinId: string
      balanceAmount: string
      balanceAmountChange: string
      frozenAmount: string
      frozenAmountChange: string
      type: string
      time: string
    }
  }

  export interface Deals {
    channel: 'spot@private.deals.v3.api.pb'
    symbol: string
    sendTime: string
    privateDeals: {
      price: string
      quantity: string
      amount: string
      tradeType: 1 | 2 // 1: Buy, 2: Sell
      tradeId: string
      orderId: string
      feeAmount: string
      feeCurrency: string
      time: string
    }
  }

  export interface Orders {
    channel: 'spot@private.orders.v3.api.pb'
    symbol: string
    sendTime: string
    privateOrders: {
      id: string
      price: string
      quantity: string
      amount: string
      avgPrice: string
      orderType: 1 | 2 | 3 | 4 | 5 | 100 // LIMIT_ORDER (1), POST_ONLY (2), IMMEDIATE_OR_CANCEL (3), FILL_OR_KILL (4), MARKET_ORDER (5); Stop loss/take profit (100)
      tradeType: 1 | 2 // 1: Buy, 2: Sell
      remainAmount: string
      remainQuantity: string
      lastDealQuantity: string
      cumulativeQuantity: string
      cumulativeAmount: string
      status: 1 | 2 | 3 | 4 | 5 // 1: Not traded, 2: Fully traded, 3: Partially traded, 4: Canceled, 5: Partially canceled
      createTime: string
    }
  }
}

// prettier-ignore
export type AnyMexcSecureResponse = MexcSecureResponses.Account | MexcSecureResponses.Deals | MexcSecureResponses.Orders
