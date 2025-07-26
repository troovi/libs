import { sleep } from '@troovi/utils-js'
import { OrangeXPublicStream } from './ws/public/stream'
import { OrangeXPublicMessages } from './ws/public/messages'
import { OrderBookServer } from '../../orderbook'
import { OrangeXApi } from './api'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: OrangeXApi
  stream: OrangeXPublicStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: OrangeXPublicMessages.OrderBook[]
}

export class OrangeXDepth {
  private logger = new Logger('orangex dom')
  private store: { [symbol: string]: Store } = {}

  private api: OrangeXApi
  private stream: OrangeXPublicStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ api, stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.stream = stream
  }

  update(event: OrangeXPublicMessages.OrderBook) {
    const symbol = event.data.instrument_name
    const source = this.store[symbol]

    if (source.initialized) {
      if (source.lastUpdateId + 1 !== event.data.change_id) {
        this.logger.error(`Out: "${symbol}": ${source.lastUpdateId} ${event.data.change_id}`, 'SYNC')

        source.initialized = false
        source.depth = []
        source.depth.push(event)

        this.onEvent(symbol, { type: 'offline' })

        sleep(8000).then(() => {
          this.logger.warn(`Reboot "${symbol}"`, 'RESTART')
          this.setup(symbol)
        })

        return
      }

      this.onEvent(symbol, {
        type: 'update',
        latency: Date.now() - event.data.timestamp,
        bids: formatOrders(event.data.bids).sort((a, b) => a[0] - b[0]),
        asks: formatOrders(event.data.asks).sort((a, b) => a[0] - b[0])
      })

      source.lastUpdateId = event.data.change_id
    } else {
      source.depth.push(event)
    }
  }

  private async setup(symbol: string) {
    this.logger.log(`Initializing "${symbol}" orderbook...`, 'SETUP')

    const snapshot = await this.api.getOrderBook({ instrument_name: symbol })

    await sleep(2500)

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: snapshot.version,
      bids: snapshot.bids,
      asks: snapshot.asks
    })

    const index = source.depth.findIndex((d) => {
      return d.data.change_id > snapshot.version
    })

    if (index !== -1) {
      source.depth.slice(index).forEach(({ data: event }) => {
        orderbook.update({
          updateId: event.change_id,
          asks: formatOrders(event.asks),
          bids: formatOrders(event.bids)
        })
      })
    }

    const state = orderbook.getSnapshot()

    source.depth = []
    source.initialized = true
    source.lastUpdateId = state.lastUpdateId

    this.logger.verbose(`Orderbook initialized: ${symbol}`, 'SETUP')

    this.onEvent(symbol, {
      type: 'snapshot',
      latency: Date.now() - +snapshot.timestamp,
      bids: state.bids,
      asks: state.asks
    })
  }

  async initialize(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = {
        initialized: false,
        lastUpdateId: -1,
        depth: []
      }
    })

    await this.stream.subscribe('orderbook', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol }))
    })

    await sleep(1000)

    for await (const symbol of symbols) {
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

    await this.stream.unsubscribe('orderbook', (createStream) => {
      return symbols.map((symbol) => createStream({ symbol }))
    })
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

const formatOrders = (orders: ['new' | 'delete', string, string][]) => {
  return orders.map(([_, price, qty]) => [+price, +qty] as [number, number])
}
