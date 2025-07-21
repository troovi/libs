import { sleep, stringify } from '@troovi/utils-js'
import { BinancePublicStream } from './ws/public/stream'
import { BinanceMessages } from './ws/public/messages'
import { OrderBookServer } from '../../orderbook'
import { BinanceFuturesApi } from './api/futures/api'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: BinanceFuturesApi
  ws: BinancePublicStream<'futures'>
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: BinanceMessages.SpotDepthUpdate[]
}

// A single connection can listen to a maximum of 1024 streams.
// There is a limit of 300 connections per attempt every 5 minutes per IP.

export class BinanceFuturesDepth {
  private logger = new Logger('binance-dom (F)')
  private store: { [symbol: string]: Store } = {}

  private api: BinanceFuturesApi
  private ws: BinancePublicStream<'futures'>

  private onEvent: (event: OrderBookEvent) => void

  constructor({ api, ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.ws = ws
  }

  update(event: BinanceMessages.FuturesDepthUpdate) {
    const source = this.store[event.s]

    if (!source) {
      return
    }

    if (source.initialized) {
      if (source.lastUpdateId !== event.pu && source.lastUpdateId !== event.U) {
        const { U, u, pu } = event

        this.logger.error(`Out: ${event.s}: ${source.lastUpdateId} ${stringify({ U, u, pu })}`, 'SYNC')

        source.initialized = false
        source.depth.push(event)

        this.onEvent({ type: 'offline', symbol: event.s })

        sleep(2000).then(() => {
          this.logger.warn(`Reboot "${event.s}"`, 'RESTART')
          this.setup(event.s)
        })

        return
      }

      this.onEvent({
        type: 'update',
        latency: Date.now() - event.E,
        symbol: event.s,
        bids: toNumber(event.b),
        asks: toNumber(event.a)
      })

      source.lastUpdateId = event.u
    } else {
      source.depth.push(event)
    }
  }

  private async setup(symbol: string) {
    this.logger.log(`Initializing "${symbol}" orderbook...`, 'SETUP')

    const snapshot = await this.api.getOrderBook({ limit: 1000, symbol })

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: snapshot.lastUpdateId,
      bids: snapshot.bids,
      asks: snapshot.asks
    })

    // console.log('snapshot lastUpdateId:', snapshot.lastUpdateId)

    const index = source.depth.findIndex((d) => {
      return snapshot.lastUpdateId >= d.U && snapshot.lastUpdateId <= d.u
    })

    if (index !== -1) {
      source.depth.slice(index).forEach((event) => {
        orderbook.update({ updateId: event.u, asks: event.a, bids: event.b })
      })
    }

    // console.log(source.depth.map(({ U, u }) => ({ u, U })))

    const state = orderbook.getSnapshot()

    // console.log(state.lastUpdateId)

    source.depth = []
    source.initialized = true
    source.lastUpdateId = state.lastUpdateId

    this.logger.verbose(`Orderbook initialized: ${symbol}`, 'SETUP')

    this.onEvent({
      type: 'snapshot',
      symbol,
      latency: Date.now() - snapshot.T,
      bids: state.bids,
      asks: state.asks
    })
  }

  async initialize(symbols: string[]) {
    for await (const symbol of symbols) {
      this.store[symbol] = {
        initialized: false,
        lastUpdateId: -1,
        depth: []
      }

      await this.ws.subscribe(({ diffBookDepth }) => diffBookDepth({ symbol, speed: 100 }))
      await sleep(2000)
      await this.setup(symbol)
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = {
        initialized: false,
        lastUpdateId: -1,
        depth: []
      }
    })

    await this.ws.unsubscribe(({ diffBookDepth }) => {
      return symbols.map((symbol) => diffBookDepth({ symbol, speed: 100 }))
    })
  }
}
