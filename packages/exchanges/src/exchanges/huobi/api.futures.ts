import { AxiosError } from 'axios'
import { Candle } from '@troovi/chart'
import { ApiClient } from '../../api'
import { createAuthStrategy } from './authStrategy'
import { FrequencyLimiter } from '@troovi/utils-nodejs'

interface Response<T> {
  data: T
}

namespace Requests {
  export interface Kline {
    contract_code: string
    period: '1min' | '5min'
    size?: 150 | 1000 | 2000
    from?: number
    to?: number
  }

  export interface Contracts {
    contract_code?: string
    support_margin_mode?: 'cross' | 'isolated' | 'all'
  }
}

namespace Responses {
  export interface SymbolInfo {
    adjust: []
    contract_code: string
    contract_size: number
    contract_status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 // 0: Delisting, 1: Listing, 2: Pending Listing, 3: Suspension, 4: Suspending of Listing, 5: In Settlement, 6: Delivering, 7: Settlement Completed, 8: Delivered
    create_date: string
    delivery_date: '' | string
    delivery_time: '' | string // delivery time（When the contract does not need to be delivered, the field value is an empty string），millesecond timestamp
    settlement_date: string
    pair: string
    price_tick: number
    support_margin_mode: 'cross' | 'isolated' | 'all'
    symbol: string
    trade_partition: string
  }

  export interface Kline {
    id: number
    amount: number
    count: number
    open: number
    close: number
    low: number
    high: number
    vol: number
    trade_turnover: number
  }

  export interface FeeRate {
    symbol: string
    contract_code: string
    open_maker_fee: string
    open_taker_fee: string
    close_maker_fee: string
    close_taker_fee: string
    fee_asset: string
  }
}

interface APIs {
  '/linear-swap-api/v1/swap_contract_info': {
    params: Requests.Contracts
    answer: Response<Responses.SymbolInfo[]>
  }
  '/linear-swap-ex/market/history/kline': {
    params: Requests.Kline
    answer: Response<Responses.Kline[]>
  }
}

interface Options {
  apiKey: string
  apiSecret: string
}

export class HuobiFuturesApi extends ApiClient<APIs> {
  private baseLimiter = new FrequencyLimiter({
    limit: 10,
    interval: 1 * 1000,
    name: 'htx'
  })

  private rateLimiter = new FrequencyLimiter({
    limit: 20,
    interval: 2 * 1000,
    name: 'htx'
  })

  constructor({ apiKey, apiSecret }: Options) {
    super(`https://api.hbdm.com`, {
      name: 'huobi-futures',
      authStrategy: createAuthStrategy({ apiKey, apiSecret, host: 'api.hbdm.com' }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  handleRecvError<T>(request: () => Promise<T>): Promise<T> {
    return request().catch((e: AxiosError<{ code?: number }>) => {
      if (e?.response?.data?.code === 10003) {
        console.log('recvWindow error, retry...')
        return this.handleRecvError(request)
      }

      throw e
    })
  }

  // https://docs.trade.newhuotech.com/docs/usdt_swap/v1/en/#general-query-swap-info

  getContracts(params: Requests.Contracts = {}) {
    return this.baseLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/linear-swap-api/v1/swap_contract_info', params).then(
        ({ data }) => data
      )
    })
  }

  // https://docs.trade.newhuotech.com/docs/usdt_swap/v1/en/#general-query-information-on-swap-trading-fee

  getFees(contract_code?: string) {
    return this.rateLimiter.wrap(1, () => {
      return this.signRequest<Response<Responses.FeeRate[]>>('POST', '/linear-swap-api/v1/swap_fee', {
        contract_code
      })
    })
  }

  // https://docs.trade.newhuotech.com/docs/usdt_swap/v1/en/#general-get-market-bbo-data

  getChart(params: Requests.Kline): Promise<Candle[]> {
    return this.baseLimiter.wrap(1, () => {
      return this.apiRequest('GET', '/linear-swap-ex/market/history/kline', params).then(({ data }) => {
        return data.map(({ id, high, open, low, close, vol, amount }) => ({
          time: +id * 1000,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +vol,
          quoteVolume: +amount
        }))
      })
    })
  }
}
