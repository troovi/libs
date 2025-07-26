import { sleep } from '@troovi/utils-js'

import { OrderBookServer } from '../../orderbook'
import { GateSpotStream } from './ws/spot/stream'
import { GateApi } from './api'
import { GateSpotMessages } from './ws/spot/messages'
import { toNumber } from '../../utils'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: GateApi
  stream: GateSpotStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: GateSpotMessages.OrderBookUpdate[]
}

export class GateSpotDepth {
  private logger = new Logger('gate.io dom (S)')
  private store: { [symbol: string]: Store } = {}

  private api: GateApi
  private stream: GateSpotStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ api, stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.stream = stream
  }

  update(event: GateSpotMessages.OrderBookUpdate) {
    const source = this.store[event.result.s]

    if (source.initialized) {
      if (source.lastUpdateId + 1 !== event.result.U) {
        this.logger.error(`Out: "${event.result.s}": ${source.lastUpdateId}, ${event.result.U}`, 'SYNC')

        source.initialized = false
        source.depth.push(event)

        this.onEvent(event.result.s, { type: 'offline' })

        sleep(4000).then(() => {
          this.logger.warn(`Reboot "${event.result.s}"`, 'RESTART')
          this.setup(event.result.s)
        })

        return
      }

      this.onEvent(event.result.s, {
        type: 'update',
        latency: Date.now() - event.time_ms,
        bids: toNumber(event.result.b),
        asks: toNumber(event.result.a)
      })

      source.lastUpdateId = event.result.u
    } else {
      source.depth.push(event)
    }
  }

  private async setup(symbol: string) {
    this.logger.log(`Initializing "${symbol}" orderbook...`, 'SETUP')

    const snapshot = await this.api.getSpotOrderBook({
      currency_pair: symbol,
      limit: 100,
      with_id: true
    })

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: snapshot.id!,
      bids: snapshot.bids,
      asks: snapshot.asks
    })

    const index = source.depth.findIndex(
      ({ result: { U, u } }) => U <= snapshot.id! + 1 && u >= snapshot.id! + 1
    )

    if (index !== -1) {
      source.depth.slice(index).forEach(({ result: event }) => {
        orderbook.update({ updateId: event.u, asks: event.a, bids: event.b })
      })
    } else {
      if (source.depth[0] && snapshot.id! < source.depth[0].result.U) {
        this.logger.warn(`Remake snapshot: "${symbol}"`, 'snapshot')

        await sleep(1000)
        await this.setup(symbol)

        return
      }
    }

    const state = orderbook.getSnapshot()

    source.depth = []
    source.initialized = true
    source.lastUpdateId = state.lastUpdateId

    this.logger.verbose(`Orderbook initialized: ${symbol}`, 'SETUP')

    this.onEvent(symbol, {
      type: 'snapshot',
      latency: Date.now() - snapshot.current,
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

      await this.stream.subscribe('orderbook', (createStream) => createStream({ symbol }))
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

    for await (const symbol of symbols) {
      await this.stream.unsubscribe('orderbook', (createStream) => createStream({ symbol }))
    }
  }

  break(symbol: string) {
    this.store[symbol] = {
      initialized: false,
      lastUpdateId: -1,
      depth: []
    }

    this.onEvent(symbol, { type: 'offline' })
  }
}
