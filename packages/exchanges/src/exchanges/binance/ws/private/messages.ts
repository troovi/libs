import { BinanceDefinitions } from '../../api/spot/types'

interface OrderFill {
  price: string
  qty: string
  commission: string
  commissionAsset: string
  tradeId: string
}

interface RateLimiter {
  rateLimitType: 'REQUEST_WEIGHT' | 'ORDERS' | 'RAW_REQUESTS'
  interval: 'SECOND' | 'MINUTE' | 'DAY'
  intervalNum: number
  limit: number
  count: number
}

export namespace BinanceSecureRequests {
  export interface Order {
    id: string
    method: 'order.place'
    params: {
      symbol: string
      side: BinanceDefinitions.OrderSide
      type: BinanceDefinitions.OrderType
      timeInForce?: BinanceDefinitions.OrderTimeInForce
      price?: string
      quantity?: string
      apiKey: string
      signature: string
      timestamp: number
      recvWindow?: number
      newOrderRespType: 'FULL'
    }
  }

  export interface Time {
    id: string
    method: 'time'
  }

  export interface Ping {
    id: string
    method: 'ping'
  }
}

export namespace BinanceSecureResponses {
  export interface Order {
    symbol: string
    orderId: number
    orderListId?: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: BinanceDefinitions.OrderStatus
    timeInForce: BinanceDefinitions.OrderTimeInForce
    type: BinanceDefinitions.OrderType
    side: BinanceDefinitions.OrderSide
    workingTime: number
    fills: OrderFill[]
  }

  export interface Time {
    serverTime: number
  }

  export interface Ping {}
}

// prettier-ignore
export type AnyBinanceSecureRequest = BinanceSecureRequests.Order | BinanceSecureRequests.Ping | BinanceSecureRequests.Time
// prettier-ignore
export type AnyBinanceSecureResponse = BinanceSecureResponses.Order | BinanceSecureResponses.Ping | BinanceSecureResponses.Time

export namespace BinanceSecureResults {
  export interface Success {
    id: string
    status: 200
    result: AnyBinanceSecureResponse
    rateLimits: RateLimiter[]
  }

  export interface Faild {
    id: string
    status: 400 | 403 | 418 | 429
    error: {
      code: number
      msg: string
    }
    rateLimits: RateLimiter[]
  }
}
