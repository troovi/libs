import { sleep, stringify } from '@troovi/utils-js'
import { Logger } from '@troovi/utils-nodejs'
import { OrderBookServer } from '../../orderbook'
import { MexcFuturesApi } from './api/futures/api'
import { MexcFuturesPublicStream } from './ws/public-futures'
import { MexcFuturesMessages } from './ws/public-futures/messages'
import { OrderBookEvent } from '../../types'

interface Params {
  api: MexcFuturesApi
  stream: MexcFuturesPublicStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: MexcFuturesMessages.Depth[]
}

export class MexcFuturesDepth {
  private logger = new Logger('mexc dom (F)')
  private store: { [symbol: string]: Store } = {}

  private api: MexcFuturesApi
  private stream: MexcFuturesPublicStream

  private onEvent: (symbol: string, event: OrderBookEvent) => void

  constructor({ api, stream }: Params, onEvent: (symbol: string, event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.stream = stream
  }

  update(event: MexcFuturesMessages.Depth) {
    const source = this.store[event.symbol]

    if (source.initialized) {
      if (event.data.begin > source.lastUpdateId && source.lastUpdateId + 1 !== event.data.begin) {
        const { begin, end, version } = event.data

        this.logger.error(`Out ${source.lastUpdateId}: ${stringify({ begin, end, version })}`, 'SYNC')

        source.initialized = false
        source.depth.push(event)

        this.onEvent(event.symbol, { type: 'offline' })

        sleep(2000).then(() => {
          this.logger.warn(`Reboot "${event.symbol}"`, 'RESTART')
          this.setup(event.symbol)
        })

        return
      }

      this.onEvent(event.symbol, {
        type: 'update',
        latency: Date.now() - +event.ts,
        bids: formatOrders(event.data.bids).sort((a, b) => a[0] - b[0]),
        asks: formatOrders(event.data.asks).sort((a, b) => a[0] - b[0])
      })

      source.lastUpdateId = event.data.version
    } else {
      source.depth.push(event)
    }
  }

  private async setup(symbol: string) {
    this.logger.log(`Initializing "${symbol}" orderbook...`, 'SETUP')

    const snapshot = await this.api.getSnapshot(symbol)

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: snapshot.version,
      bids: formatOrders(snapshot.bids),
      asks: formatOrders(snapshot.asks)
    })

    const index = source.depth.findIndex(({ data }) => {
      return data.version > snapshot.version
    })

    if (index !== -1) {
      source.depth.slice(index).forEach(({ data: event }) => {
        orderbook.update({
          updateId: event.version,
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
      latency: Date.now() - snapshot.timestamp,
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

      await this.stream.subscribe('orderbook', (createStream) => createStream(symbol))
      await sleep(1500)
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
      await this.stream.unsubscribe('orderbook', (createStream) => createStream(symbol))
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

// Tip: [411.8, 10, 1] 411.8 is price, 10 is the order numbers of the contract, 1 is the order quantity

const formatOrders = (data: [number, number, number][]) => {
  return data.map(([price, qty, amount]) => {
    return [price, qty] as [number, number]
  })
}
