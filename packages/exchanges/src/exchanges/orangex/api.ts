import { AxiosError } from 'axios'
import { ApiClient } from '../../api'
import { Candle } from '@troovi/chart'
import { OrangeXLimiter } from './limiter'

interface Options {
  apiKey: string
  apiSecret: string
}

interface Response<T> {
  id: string
  jsonrpc: string
  usIn: number
  usOut: number
  usDiff: number
  result: T
}

export namespace OrangeXRequests {
  export interface Instruments {}

  export interface Kbars {
    instrument_name: string
    start_timestamp: string
    end_timestamp: string
    resolution: '1' | '5'
  }

  export interface OrderBook {
    instrument_name: string
    depth?: 0 | 100 // Not defined or 0 = full order book. Depth = 100 means 100 for each bid/ask side.
  }
}

export namespace OrangeXResponses {
  export interface InstrumentInfo {
    instrId: number
    currency: 'SPOT' | 'PERPETUAL'
    newListing: boolean
    base_currency: string
    creation_timestamp: string
    expiration_timestamp: string
    instrument_name: string
    show_name: string
    is_active: boolean
    kind: 'spot' | 'perpetual'
    leverage: number
    maker_commission: string
    taker_commission: string
    min_trade_amount: string
    quote_currency: string
    tick_size: string
    order_price_low_rate: string
    order_price_high_rate: string
    order_price_limit_type: number
    min_qty: string
    min_notional: string
    support_trace_trade: boolean
  }

  export type Kline = {
    tick: number
    open: string
    high: string
    low: string
    close: string
    volume: string
    cost: string
  }

  export interface OrderBook {
    asks: [string, string][]
    bids: [string, string][]
    timestamp: string
    version: number
  }
}

interface APIs {
  '/public/get_instruments': {
    params: OrangeXRequests.Instruments
    answer: Response<OrangeXResponses.InstrumentInfo[]>
  }
  '/public/get_tradingview_chart_data': {
    params: OrangeXRequests.Kbars
    answer: Response<OrangeXResponses.Kline[]>
  }
  '/public/get_order_book': {
    params: OrangeXRequests.OrderBook
    answer: Response<OrangeXResponses.OrderBook>
  }
}

export class OrangeXApi extends ApiClient<APIs> {
  private limiter: OrangeXLimiter

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.orangex.com/api/v1`, {
      name: 'orangex',
      authStrategy: (method, endpoint) => {
        return { method, url: endpoint }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.limiter = new OrangeXLimiter()
  }

  handleRecvError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ retCode?: number }>) => {
      if (e?.response?.data?.retCode === 10002) {
        console.log('recvWindow error, retry...')
        return this.handleRecvError(request)
      }

      throw e
    })
  }

  // https://openapi-docs.orangex.com/#get-instruments

  getInstrumentsInfo() {
    return this.limiter.limiter(() => {
      return this.apiRequest('GET', '/public/get_instruments', {})
    })
  }

  // https://openapi-docs.orangex.com/#get-kbar

  getChart(params: OrangeXRequests.Kbars): Promise<Candle[]> {
    return this.limiter.limiter(() => {
      return this.apiRequest('GET', '/public/get_tradingview_chart_data', params).then(({ result }) => {
        return result.map(({ tick, open, high, low, close, volume, cost }) => ({
          time: tick * 1000,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
          quoteVolume: +cost
        }))
      })
    })
  }

  // https://openapi-docs.orangex.com/#get-order-book

  getOrderBook(params: OrangeXRequests.OrderBook) {
    return this.limiter.limiter(() => {
      return this.apiRequest('GET', '/public/get_order_book', params).then(({ result }) => {
        return result
      })
    })
  }
}

// https://api.orangex.com/api/v1/public/get_tradingview_chart_data?resolution=1&start_timestamp=1749446198000&end_timestamp=1749450998000&instrument_name=EGLD-USDT-PERPETUAL
