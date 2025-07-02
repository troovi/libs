import crypto from 'crypto'

import { AxiosError } from 'axios'
import { sortObject } from '../../utils'
import { ApiClient } from '../../api'
import { Candle } from '@troovi/chart'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Options {
  apiKey: string
  apiSecret: string
}

export namespace GateRequests {
  export interface FetchContracts {
    limit?: number
    offset?: number
  }

  export interface Fees {
    currency_pair?: string
    settle?: 'BTC' | 'USDT' | 'USD'
  }

  export interface SpotCandles {
    currency_pair: string
    // limit is conflicted with from and to. If either from or to is specified, request will be rejected.
    limit?: number
    from?: number
    to?: number
    interval?: '1m' | '5m'
  }

  export interface FuturesCandles {
    contract: string
    // limit is conflicted with from and to. If either from or to is specified, request will be rejected.
    limit?: number
    from?: number
    to?: number
    interval?: '1m' | '5m'
  }

  export interface SpotOrderBook {
    currency_pair: string
    interval?: string
    limit?: 100 | 1000
    with_id?: boolean
  }

  export interface FuturesOrderBook {
    contract: string
    interval?: string
    limit?: 100 | 1000
    with_id?: boolean
  }
}

export namespace GateResponses {
  export interface SpotInstrumentInfo {
    id: string
    base: string
    base_name: string
    quote: string
    quote_name: string
    fee: string
    min_base_amount: string
    min_quote_amount: string
    max_quote_amount: string
    amount_precision: number
    precision: number
    trade_status: 'tradable' | 'sellable' | 'buyable' | 'untradable'
    sell_start: number
    buy_start: number
    type: 'normal' | 'premarket'
    trade_url: string
  }

  export interface FuturesInstrumentInfo {
    name: string
    type: 'direct' | 'inverse'
    quanto_multiplier: string
    ref_discount_rate: string
    order_price_deviate: string
    maintenance_rate: string
    mark_type: 'index' | 'internal'
    last_price: string
    mark_price: string
    index_price: string
    funding_rate_indicative: string
    mark_price_round: string
    funding_offset: number
    in_delisting: boolean
    risk_limit_base: string
    interest_rate: string
    order_price_round: string
    order_size_min: number
    ref_rebate_rate: string
    funding_interval: number
    risk_limit_step: string
    leverage_min: string
    leverage_max: string
    risk_limit_max: string
    maker_fee_rate: string
    taker_fee_rate: string
    funding_rate: string
    order_size_max: number
    funding_next_apply: number
    short_users: number
    config_change_time: number
    trade_size: number
    position_size: number
    long_users: number
    funding_impact_value: string
    orders_limit: number
    trade_id: number
    orderbook_id: number
    enable_bonus: boolean
    enable_credit: boolean
    create_time: number
    funding_cap_ratio: string
    is_pre_market?: boolean
  }

  export interface Fees {
    user_id: number
    taker_fee: string
    maker_fee: string
    gt_discount: boolean
    gt_taker_fee: string
    gt_maker_fee: string
    loan_fee: string
    point_type: '1'
    futures_taker_fee: string
    futures_maker_fee: string
    delivery_taker_fee: string
    delivery_maker_fee: string
    debit_fee: 1 | 2 | 3
  }

  export type SpotKline = [
    string, // Unix timestamp with second precision
    string, // Trading volume in quote currency
    string, // Closing price
    string, // Highest price
    string, // Lowest price
    string, // Opening price
    string // Trading volume in base currency
  ]

  export interface FuturesKline {
    t: number
    v: number
    c: string
    h: string
    l: string
    o: string
    sum: string
  }

  export interface SpotOrderBook {
    id?: number
    current: number
    update: number
    asks: [string, string][]
    bids: [string, string][]
  }

  export interface FuturesOrderBook {
    id: number
    current: number
    update: number
    asks: { p: string; s: number }[]
    bids: { p: string; s: number }[]
  }
}

interface APIs {
  '/spot/currency_pairs': {
    params: {}
    answer: GateResponses.SpotInstrumentInfo[]
  }
  '/futures/usdt/contracts': {
    params: GateRequests.FetchContracts
    answer: GateResponses.FuturesInstrumentInfo[]
  }
  '/spot/candlesticks': {
    params: GateRequests.SpotCandles
    answer: GateResponses.SpotKline[]
  }
  '/spot/order_book': {
    params: GateRequests.SpotOrderBook
    answer: GateResponses.SpotOrderBook
  }
  '/futures/usdt/order_book': {
    params: GateRequests.FuturesOrderBook
    answer: GateResponses.FuturesOrderBook
  }
  '/futures/usdt/candlesticks': {
    params: GateRequests.FuturesCandles
    answer: GateResponses.FuturesKline[]
  }
}

export class GateApi extends ApiClient<APIs> {
  //All public endpoints: 200r/10s per endpoint
  private publicLimiter = new FrequencyLimiter({
    limit: 200,
    interval: 1000 * 10,
    name: 'io'
  })

  // 200r/10s per endpoint
  private futuresLimiter = new FrequencyLimiter({
    limit: 200,
    interval: 1000 * 10,
    name: 'io'
  })

  // 200r/10s per endpoint
  private spotLimiter = new FrequencyLimiter({
    limit: 200,
    interval: 1000 * 10,
    name: 'io'
  })

  // 200r/10s per endpoint
  private walletLimiter = new FrequencyLimiter({
    limit: 200,
    interval: 1000 * 10,
    name: 'io'
  })

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.gateio.ws/api/v4`, {
      name: 'gate.io',
      authStrategy: (method, endpoint, options) => {
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const request: Record<string, object | string> = {}

        const prehash = [method, `/api/v4${endpoint}`]

        if (method === 'GET') {
          const query = new URLSearchParams(sortObject(options)).toString()
          request.url = query ? `${endpoint}?${query}` : endpoint

          // query
          prehash.push(query)
          // hashedPayload
          prehash.push(crypto.createHash('sha512').update('').digest('hex'))
          // timestamp
          prehash.push(timestamp)
        } else {
          request.body = options

          // query
          prehash.push('')
          // hashedPayload
          prehash.push(crypto.createHash('sha512').update(JSON.stringify(options)).digest('hex'))
          // timestamp
          prehash.push(timestamp)
        }

        return {
          method,
          ...request,
          headers: {
            KEY: apiKey,
            SIGN: crypto.createHmac('sha512', apiSecret).update(prehash.join('\n')).digest('hex'),
            Timestamp: timestamp
          }
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRectError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ retCode?: number }>) => {
      if (e?.response?.data?.retCode === 10002) {
        console.log('recvWindow error, retry...')
        return this.handleRectError(request)
      }

      throw e
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#list-all-currency-pairs-supported

  getSpotInstruments() {
    return this.publicLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/spot/currency_pairs', {})
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#list-all-futures-contracts

  getFuturesInstruments(params: GateRequests.FetchContracts = {}) {
    return this.publicLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/futures/usdt/contracts', params)
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#retrieve-personal-trading-fee

  getFees(params: GateRequests.Fees) {
    return this.walletLimiter.wrap(1, () => {
      return this.signRequest<GateResponses.Fees>('GET', '/wallet/fee', params)
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#market-candlesticks

  getSpotChart(params: GateRequests.SpotCandles): Promise<Candle[]> {
    return this.publicLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/spot/candlesticks', params).then((data) => {
        return data.map(([time, quoteVolume, close, high, low, open, volume]) => ({
          time: +time * 1000,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
          quoteVolume: +quoteVolume
        }))
      })
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#get-futures-candlesticks

  getFuturesChart(params: GateRequests.FuturesCandles): Promise<Candle[]> {
    return this.publicLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/futures/usdt/candlesticks', params).then((data) => {
        return data.map(({ t, v, h, l, o, c, sum }) => ({
          time: t * 1000,
          open: +o,
          high: +h,
          low: +l,
          close: +c,
          volume: +v,
          quoteVolume: +sum
        }))
      })
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#retrieve-order-book

  getSpotOrderBook(params: GateRequests.SpotOrderBook) {
    return this.publicLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/spot/order_book', params)
    })
  }

  // https://www.gate.com/docs/developers/apiv4/en/#futures-order-book

  getFuturesOrderBook(params: GateRequests.FuturesOrderBook) {
    return this.publicLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/futures/usdt/order_book', params)
    })
  }
}
