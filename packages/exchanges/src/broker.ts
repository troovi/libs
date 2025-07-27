import type { Candle } from '@troovi/chart'
import { OrderBookEvent, TradeEvent, Exchange } from './types'
import { ChartOptions } from './formatters'

interface Meta {
  exchange: string
  market: 'spot' | 'futures'
}

namespace Events {
  export interface Depth {
    type: 'depth'
    symbol: string
    event: OrderBookEvent
  }

  export interface Trade {
    type: 'trade'
    symbol: string
    event: TradeEvent[]
  }

  export interface Kline {
    type: 'kline'
    symbol: string
    event: Candle
  }
}

namespace Topics {
  export interface Trade {
    stream: 'trade'
    symbol: string
  }

  export interface Depth {
    stream: 'depth'
    symbols: string[]
  }

  export interface Kline {
    stream: 'kline'
    symbol: string
    interval: '1m' | '5m'
  }
}

type AnyEvent = Events.Kline | Events.Depth | Events.Trade
type AnyTopic = Topics.Kline | Topics.Depth | Topics.Trade

export type StreamEvent = AnyEvent & Meta
export type StreamTopic = AnyTopic & Meta

// prettier-ignore
export type ExchangeStream = (onEvent: (market: 'spot' | 'futures', event: AnyEvent) => void) => {
  subscribe: (data: AnyTopic & Pick<Meta, 'market'>) => Promise<void>
  unsubscribe: (data: AnyTopic & Pick<Meta, 'market'>) => Promise<void>
}

export namespace APIsParams {
  export interface Symbols extends Meta {}
  export interface Chart extends ChartOptions, Meta {}
  export interface Fees extends Meta {
    symbols: string[]
  }
}

export class Broker {
  private streams: { [exchange: string]: ReturnType<ExchangeStream> } = {}
  private apis: { [exchange: string]: Pick<Exchange, 'getChart' | 'getFees' | 'getSymbols'> } = {}
  private emitter: (data: StreamEvent) => void = () => {}

  constructor(private exchanges: Exchange[]) {
    exchanges.forEach(({ name, createStream, getChart, getFees, getSymbols }) => {
      this.streams[name] = createStream((market, event) => {
        this.emitter({ market, exchange: name, ...event } as StreamEvent)
      })

      this.apis[name] = { getChart, getFees, getSymbols }
    })
  }

  getExchanges() {
    return this.exchanges.map(({ name }) => name)
  }

  // stream

  onEvent(callback: (data: StreamEvent) => void) {
    this.emitter = callback
  }

  subscribe(data: StreamTopic) {
    return this.streams[data.exchange].subscribe(data)
  }

  unsubscribe(data: StreamTopic) {
    return this.streams[data.exchange].unsubscribe(data)
  }

  // api

  getChart({ exchange, market, ...data }: APIsParams.Chart) {
    return this.apis[exchange].getChart(market, data)
  }

  getFees({ exchange, market, symbols }: APIsParams.Fees) {
    return this.apis[exchange].getFees(market, symbols)
  }

  getSymbols({ exchange, market }: APIsParams.Symbols) {
    return this.apis[exchange].getSymbols(market)
  }
}
