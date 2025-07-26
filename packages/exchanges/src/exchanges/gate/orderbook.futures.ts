import { sleep } from '@troovi/utils-js'

import { OrderBookServer } from '../../orderbook'
import { GateFuturesStream } from './ws/futures/stream'
import { GateApi } from './api'
import { GateFuturesMessages } from './ws/futures/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: GateApi
  stream: GateFuturesStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  isUpdateAhead: boolean
  depth: GateFuturesMessages.OrderBookUpdate[]
}

export class GateFuturesDepth {
  private logger = new Logger('gate.io dom (F)')
  private store: { [symbol: string]: Store } = {}

  private api: GateApi
  private stream: GateFuturesStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ api, stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.stream = stream
  }

  update(event: GateFuturesMessages.OrderBookUpdate) {
    const { s: symbol, b: bids, a: asks, U, u } = event.result
    const source = this.store[symbol]

    if (source.initialized) {
      if (source.isUpdateAhead) {
        if (source.lastUpdateId > u) {
          this.logger.log(`Pass update "${symbol}": ${source.lastUpdateId} > ${u}`, 'SYNC')
          return
        }

        if (U <= source.lastUpdateId + 1 && u >= source.lastUpdateId + 1) {
          this.logger.log(`Matched "${symbol}": ${source.depth} ${source.lastUpdateId} to ${u}`, 'SYNC')

          source.isUpdateAhead = false
          source.lastUpdateId = U - 1
        } else {
          this.logger.error(`Async: "${symbol}": ${source.lastUpdateId}, ${U}-${u}`, 'SYNC')
          return
        }
      }

      if (source.lastUpdateId + 1 !== U) {
        this.logger.error(`Out: ${source.lastUpdateId} ${U}-${u}`, 'SYNC')

        source.initialized = false
        source.isUpdateAhead = false
        source.depth.push(event)

        this.onEvent(symbol, { type: 'offline' })

        sleep(4000).then(() => {
          this.logger.warn(`Reboot "${symbol}"`, 'RESTART')
          this.setup(symbol)
        })

        return
      }

      source.lastUpdateId = u

      this.onEvent(symbol, {
        type: 'update',
        latency: Date.now() - event.time_ms,
        bids: formatOrders(bids),
        asks: formatOrders(asks)
      })
    } else {
      source.depth.push(event)
    }
  }

  private async setup(symbol: string) {
    this.logger.log(`Initializing "${symbol}" orderbook...`, 'SETUP')

    const snapshot = await this.api.getFuturesOrderBook({
      contract: symbol,
      limit: 100,
      with_id: true
    })

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: snapshot.id!,
      bids: formatOrders(snapshot.bids),
      asks: formatOrders(snapshot.asks)
    })

    const index = source.depth.findIndex(
      ({ result: { U, u } }) => U <= snapshot.id! + 1 && u >= snapshot.id! + 1
    )

    if (index !== -1) {
      source.depth.slice(index).forEach(({ result: event }) => {
        orderbook.update({
          updateId: event.u,
          asks: formatOrders(event.a),
          bids: formatOrders(event.b)
        })
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
    source.isUpdateAhead = index === -1

    if (source.isUpdateAhead) {
      this.logger.warn(`Update is ahead: "${symbol}"`, 'SYNC')
    }

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
        isUpdateAhead: false,
        depth: []
      }

      await this.stream.subscribe('orderbook', (createStream) => {
        return createStream({ symbol, speed: '100ms', level: '100' })
      })

      await this.setup(symbol)
    }
  }

  async stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = {
        initialized: false,
        lastUpdateId: -1,
        isUpdateAhead: false,
        depth: []
      }
    })

    for await (const symbol of symbols) {
      await this.stream.unsubscribe('orderbook', (createStream) => {
        return createStream({ symbol, speed: '100ms', level: '100' })
      })
    }
  }

  break(symbol: string) {
    this.store[symbol] = {
      initialized: false,
      lastUpdateId: -1,
      isUpdateAhead: false,
      depth: []
    }

    this.onEvent(symbol, { type: 'offline' })
  }
}

const formatOrders = (orders: { p: string; s: number }[]) => {
  return orders.map((order) => [+order.p, order.s] as [number, number])
}
