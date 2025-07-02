import { Candle } from '@troovi/chart'
import { FrequencyLimiter } from '@troovi/utils-nodejs'
import { ApiClient } from '../../../../api'
import { MexcDefinitions } from './types'
import { getHexSignature } from '../../../../crypto'

interface ResponseWrapper<T> {
  data: T
  code: number
  msg: string
  timestamp: number
}

export namespace MexcSpotRequests {
  export interface Klines {
    symbol: string
    interval: '1m' | '5m'
    startTime?: number
    endTime?: number
    limit: 500
  }

  export interface Depth {
    symbol: string
    limit: 1000
  }

  export interface Order {
    symbol: string
    side: MexcDefinitions.OrderSide
    type: MexcDefinitions.OrderType
    quantity?: string
    quoteOrderQty?: string
    price?: string
    newClientOrderId?: string
    recvWindow?: string
    signature: string
    timestamp: string
  }

  export interface CancelOrder {
    symbol: string
    orderId: string
    origClientOrderId?: string
    newClientOrderId?: string
    recvWindow?: string
    timestamp: string
    signature: string
  }

  export interface BookTicker {
    symbol: string
  }
}

export namespace MexcSpotResponses {
  export interface Depth {
    lastUpdateId: number
    timestamp: number
    bids: [string, string][]
    asks: [string, string][]
  }

  export interface InfoSymbol {
    symbol: string
    status: '1' | '2' | '3'
    baseAsset: string
    baseAssetPrecision: number
    quoteAsset: string
    quotePrecision: number
    quoteAssetPrecision: number
    baseCommissionPrecision: number
    quoteCommissionPrecision: number
    orderTypes: MexcDefinitions.OrderType[]
    quoteOrderQtyMarketAllowed: boolean
    isSpotTradingAllowed: boolean
    isMarginTradingAllowed: boolean
    quoteAmountPrecision: string
    quoteAmountPrecisionMarket: string
    baseSizePrecision: string
    permissions: string[]
    filters: []
    maxQuoteAmount: string
    makerCommission: string
    takerCommission: string
    tradeSideType: 1 | 2 | 3 | 4
  }

  export type Kline = [
    number, // open time
    string, // open
    string, // high
    string, // low
    string, // close
    string, // volume
    number, // close time
    string // Quote asset volume
  ]

  export interface Trade {
    id: null
    price: string
    qty: string
    quoteQty: string
    time: number
    isBuyerMaker: boolean
    isBestMatch: boolean
  }

  export interface Order {
    symbol: string
    orderId: string
    orderListId: number
    price: string
    origQty: string
    type: MexcDefinitions.OrderType
    side: MexcDefinitions.OrderSide
    transactTime: number
    quantity?: string
    quoteOrderQty?: string
  }

  export interface OpenOrderInfo {
    symbol: string
    orderId: string
    orderListId: number
    clientOrderId: string
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: MexcDefinitions.OrderStatus
    timeInForce: null | string
    type: MexcDefinitions.OrderType
    side: MexcDefinitions.OrderSide
    stopPrice: null | string
    icebergQty: null | string
    time: number
    updateTime: null | number
    isWorking: boolean
    origQuoteOrderQty: string
  }

  export interface CancelOrder {
    symbol: string
    orderId: string
    price: string
    origQty: string
    type: MexcDefinitions.OrderType
    side: MexcDefinitions.OrderSide
    executedQty: string
    cummulativeQuoteQty: string
    status: MexcDefinitions.OrderStatus
  }

  export interface AccountInfo {
    canTrade: boolean
    canWithdraw: boolean
    canDeposit: boolean
    updateTime: null
    accountType: 'SPOT'
    balances: { asset: string; free: string; locked: string }[]
    permissions: 'SPOT'[]
  }

  export interface BookTicker {
    symbol: string
    bidPrice: string
    bidQty: string
    askPrice: string
    askQty: string
  }

  export interface CoinNetwork {
    coin: string
    depositDesc: string
    depositEnable: boolean
    minConfirm: number
    name: string
    network: string
    withdrawEnable: boolean
    withdrawFee: string
    withdrawMax: string
    withdrawMin: string
    sameAddress: boolean
    contract: string
    withdrawIntegerMultiple: null
    withdrawTips: null | string
    depositTips: null | string
    netWork: string
  }

  export interface CoinInfo {
    coin: string
    Name: string
    networkList: CoinNetwork[]
  }

  export interface TradeFee {
    makerCommission: number
    takerCommission: number
  }
}

interface APIs {
  '/api/v3/exchangeInfo': {
    params: {}
    answer: { symbols: MexcSpotResponses.InfoSymbol[] }
  }
  '/api/v3/depth': {
    params: MexcSpotRequests.Depth
    answer: MexcSpotResponses.Depth
  }
  '/api/v3/klines': {
    params: MexcSpotRequests.Klines
    answer: MexcSpotResponses.Kline[]
  }
  '/api/v3/trades': {
    params: { symbol: string }
    answer: MexcSpotResponses.Trade[]
  }
  'api/v3/ticker/bookTicker': {
    params: MexcSpotRequests.BookTicker
    answer: MexcSpotResponses.BookTicker
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class MexcSpotApi extends ApiClient<APIs> {
  // Each endpoint with IP limits has an independent 500 every 10 second limit.
  private limiter = new FrequencyLimiter({ limit: 500, interval: 15 * 1000, name: 'mexc' })

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.mexc.com`, {
      name: 'mexc-spot',
      headers: {
        'Content-Type': 'application/json'
      },
      authStrategy: (method, url, options) => {
        const params = {
          ...options,
          timestamp: (Date.now() - 200).toString()
        }

        const query = new URLSearchParams(params)
        query.append('signature', getHexSignature(apiSecret, query.toString()))

        return { method, url: `${url}?${query.toString()}`, headers: { 'X-MEXC-APIKEY': apiKey } }
      }
    })
  }

  // api

  getSymbols() {
    return this.limiter.wrap(10, () => {
      return this.apiRequest('GET', '/api/v3/exchangeInfo', {}).then((data) => data.symbols)
    })
  }

  getOrderBookSnapshot(symbol: string) {
    return this.limiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v3/depth', { symbol, limit: 1000 })
    })
  }

  getChart(params: MexcSpotRequests.Klines): Promise<Candle[]> {
    return this.limiter.wrap(1, () => {
      return this.apiRequest('GET', '/api/v3/klines', params).then((data) => {
        return data.map(([time, open, high, low, close, volume, , quoteVolume]) => {
          return {
            time,
            open: +open,
            high: +high,
            low: +low,
            close: +close,
            volume: +volume,
            quoteVolume: +quoteVolume
          }
        })
      })
    })
  }

  getTrades(symbol: string) {
    return this.limiter.wrap(5, () => {
      return this.apiRequest('GET', '/api/v3/trades', { symbol })
    })
  }

  getBookTicker(symbol: string) {
    return this.limiter.wrap(1, () => {
      return this.apiRequest('GET', 'api/v3/ticker/bookTicker', { symbol })
    })
  }

  getCurrencyInfo() {
    return this.limiter.wrap(10, () => {
      return this.signRequest<MexcSpotResponses.CoinInfo[]>('GET', '/api/v3/capital/config/getall', {})
    })
  }

  order(params: Omit<MexcSpotRequests.Order, 'signature' | 'timestamp'>) {
    return this.limiter.wrap(1, () => {
      return this.signRequest<MexcSpotResponses.Order>('POST', '/api/v3/order', params)
    })
  }

  cancelOrder(params: Omit<MexcSpotRequests.CancelOrder, 'signature' | 'timestamp'>) {
    return this.limiter.wrap(1, () => {
      return this.signRequest<MexcSpotResponses.CancelOrder>('DELETE', '/api/v3/order', params)
    })
  }

  accountInfo() {
    return this.limiter.wrap(1, () => {
      return this.signRequest<MexcSpotResponses.AccountInfo>('GET', '/api/v3/account', {})
    })
  }

  getActiveOrders(symbol: string) {
    return this.limiter.wrap(3, () => {
      return this.signRequest<MexcSpotResponses.OpenOrderInfo[]>('GET', '/api/v3/openOrders', {
        symbol
      })
    })
  }

  getSymbolCommission(symbol: string) {
    return this.limiter.wrap(3, () => {
      return this.signRequest<ResponseWrapper<MexcSpotResponses.TradeFee>>('GET', '/api/v3/tradeFee', {
        symbol
      })
    })
  }

  createListenKey() {
    return this.limiter.wrap(1, () => {
      return this.signRequest<{ listenKey: string }>('POST', '/api/v3/userDataStream', {})
    })
  }

  getListenKeys() {
    return this.limiter.wrap(1, () => {
      return this.signRequest<{ listenKey: string[] }>('GET', '/api/v3/userDataStream', {})
    })
  }

  extendListenKey(listenKey: string) {
    return this.limiter.wrap(1, () => {
      return this.signRequest<{ listenKey: string }>('PUT', '/api/v3/userDataStream', { listenKey })
    })
  }

  closeListenKey(listenKey: string) {
    return this.limiter.wrap(1, () => {
      return this.signRequest<{ listenKey: string }>('DELETE', '/api/v3/userDataStream', { listenKey })
    })
  }
}
