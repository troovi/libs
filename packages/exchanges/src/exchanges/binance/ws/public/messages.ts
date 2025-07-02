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

  export interface BookTicker {
    u: number // order book updateId
    s: string // symbol
    b: string // best bid price
    B: string // best bid qty
    a: string // best ask price
    A: string // best ask qty
  }
}

type Spot = BinanceMessages.aggTrade | BinanceMessages.SpotDepthUpdate | BinanceMessages.trade
type Futures = BinanceMessages.aggTrade | BinanceMessages.FuturesDepthUpdate

export type AnyBinanceMessage<M extends 'spot' | 'futures'> = M extends 'spot' ? Spot : Futures
