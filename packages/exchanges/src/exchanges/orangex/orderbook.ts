import { sleep } from '@troovi/utils-js'
import { OrangeXPublicStream } from './ws/public/stream'
import { OrangeXPublicMessages } from './ws/public/messages'
import { OrderBookCache } from '../../orderbook'
import { OrangeXApi } from './api'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: OrangeXApi
  ws: OrangeXPublicStream
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
  private ws: OrangeXPublicStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ api, ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.ws = ws
  }

  update(event: OrangeXPublicMessages.OrderBook) {
    const symbol = event.data.instrument_name
    const source = this.store[symbol]

    if (source.initialized) {
      if (source.lastUpdateId + 1 !== event.data.change_id) {
        this.logger.error(`Out: "${symbol}": ${event.data.change_id}: ${source.lastUpdateId}`, 'SYNC')

        source.initialized = false
        source.depth.push(event)

        this.onEvent({ type: 'offline', symbol })

        sleep(8000).then(() => {
          this.logger.warn(`Reboot "${symbol}"`, 'RESTART')
          this.setup(symbol)
        })

        return
      }

      this.onEvent({
        type: 'update',
        symbol,
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

    const orderbook = new OrderBookCache()
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

    const state = orderbook.getState()

    source.depth = []
    source.initialized = true
    source.lastUpdateId = state.lastUpdateId

    this.logger.verbose(`Orderbook initialized: ${symbol}`, 'SETUP')

    this.onEvent({
      type: 'snapshot',
      symbol,
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

    await this.ws.subscribe(({ orderbook }) => {
      return symbols.map((symbol) => orderbook({ symbol }))
    })

    await sleep(1500)

    for await (const symbol of symbols) {
      await this.setup(symbol)
      await sleep(500)
    }
  }

  stop(symbols: string[]) {
    symbols.forEach((symbol) => {
      this.store[symbol] = {
        initialized: false,
        lastUpdateId: -1,
        depth: []
      }

      this.onEvent({ type: 'offline', symbol })
    })
  }
}

const formatOrders = (orders: ['new' | 'delete', string, string][]) => {
  return orders.map(([_, price, qty]) => [+price, +qty] as [number, number])
}
