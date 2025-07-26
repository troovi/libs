import { Candle } from '@troovi/chart'
import { ChartOptions } from './formatters'
import { ExchangeStream } from './broker'

export interface Fee {
  symbol: string
  takerCommission: number
  makerCommission: number
}

export type ChartApi = (market: 'spot' | 'futures', params: ChartOptions) => Promise<Candle[]>
export type FeesApi = (market: 'spot' | 'futures', symbols: string[]) => Promise<Fee[]>
export type SymbolApi = (market: 'spot' | 'futures') => Promise<ExchangeSymbol[]>

export interface Exchange {
  name: string
  getChart: ChartApi
  getFees: FeesApi
  getSymbols: SymbolApi
  createStream: ExchangeStream
}

interface Data {
  type: 'snapshot' | 'update' | 'frame'
  latency: number
  bids: [number, number][]
  asks: [number, number][]
}

interface Offline {
  type: 'offline'
}

export type OrderBookEvent = Data | Offline

export interface TradeEvent {
  time: number
  isSeller: boolean
  price: string
  quantity: string
}

export interface ExchangeSymbol {
  symbol: string
  chartId: string
  bookId: string
  baseAsset: string
  quoteAsset: string
  filters: Filters
}

export interface Filters {
  minQty: number
  maxQty: number
  lotStep: number
  priceStep: number
  minAmount: number
  priceFactor: number | null
}

// export abstract class OrderBookService {
//   initialize: (symbols: string[]) => Promise<void>
//   stop: (symbols: string[]) => Promise<void>
//   break: () => void
// }
