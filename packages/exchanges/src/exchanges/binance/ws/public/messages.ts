export namespace BinanceMessages {
  export interface SpotDepthUpdate {
    e: 'depthUpdate' // Event type
    E: number // Event time
    s: string // Symbol
    U: number // First update ID in event
    u: number // Final update ID in event
    b: [
      string, // Price level to be updated
      string // Quantity
    ][] // Bids to be updated
    a: [
      string, // Price level to be updated
      string // Quantity
    ][] // Asks to be updated
  }

  export interface FuturesDepthUpdate {
    e: 'depthUpdate' // Event type
    E: number // Event time
    T: number // Transaction time
    s: string // Symbol
    U: number // First update ID in event
    u: number // Final update ID in event
    pu: number // Final update Id in last stream(ie `u` in last stream)
    b: [
      string, // Price level to be updated
      string // Quantity
    ][] // Bids to be updated
    a: [
      string, // Price level to be updated
      string // Quantity
    ][] // Asks to be updated
  }

  export interface aggTrade {
    e: 'aggTrade' // Event type
    E: number // Event time
    s: string // Symbol
    a: number // Aggregate trade ID
    p: string // Price
    q: string // Quantity
    f: number // First trade ID
    l: number // Last trade ID
    T: number // Trade time
    m: boolean // Is the buyer the market maker?
  }

  export interface trade {
    e: 'trade' // Event type
    E: number // Event time
    s: string // Symbol
    t: number // Trade ID
    p: string // Price
    q: string // Quantity
    T: number // Trade time
    m: boolean // Is the buyer the market maker?
  }

  export interface kline {
    e: 'kline' // Event type
    E: number // Event time
    s: string // Symbol
    k: {
      t: number // Kline start time
      T: number // Kline close time
      s: string // Symbol
      i: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' // Interval
      f: number // First trade ID
      L: number // Last trade ID
      o: string // Open price
      c: string // Close price
      h: string // High price
      l: string // Low price
      v: string // Base asset volume
      n: number // Number of trades
      x: boolean // Is this kline closed?
      q: string // Quote asset volume
      V: string // Taker buy base asset volume
      Q: string // Taker buy quote asset volume
      B: string // Ignore
    }
  }

  export interface BookTicker {
    u: number // order book updateId
    s: string // symbol
    b: string // best bid price
    B: string // best bid qty
    a: string // best ask price
    A: string // best ask qty
  }
}

type Spot =
  | BinanceMessages.aggTrade
  | BinanceMessages.SpotDepthUpdate
  | BinanceMessages.trade
  | BinanceMessages.kline
type Futures = BinanceMessages.aggTrade | BinanceMessages.FuturesDepthUpdate | BinanceMessages.kline

export type AnyBinanceMessage<M extends 'spot' | 'futures'> = M extends 'spot' ? Spot : Futures
