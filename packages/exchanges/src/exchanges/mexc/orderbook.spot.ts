import { sleep } from '@troovi/utils-js'
import { OrderBookServer } from '../../orderbook'
import { MexcSpotApi } from './api/spot/api'
import { MexcSpotPublicStream } from './ws/public-spot'
import { MexcMessages } from './ws/public-spot/messages'
import { OrderBookEvent } from '../../types'
import { Logger } from '@troovi/utils-nodejs'

interface Params {
  api: MexcSpotApi
  ws: MexcSpotPublicStream
}

interface Store {
  initialized: boolean
  lastUpdateId: number
  depth: MexcMessages.depthUpdate[]
}

export class MexcSpotDepth {
  private logger = new Logger('mexc dom (S)')
  private store: { [symbol: string]: Store } = {}

  private api: MexcSpotApi
  private ws: MexcSpotPublicStream

  private onEvent: (event: OrderBookEvent) => void

  constructor({ api, ws }: Params, onEvent: (event: OrderBookEvent) => void) {
    this.onEvent = onEvent
    this.api = api
    this.ws = ws
  }

  update(data: MexcMessages.depthUpdate) {
    const { symbol, publicAggreDepths: event } = data
    const source = this.store[symbol]

    if (source.initialized) {
      if (source.lastUpdateId + 1 !== +event.fromVersion) {
        this.logger.error(`${source.lastUpdateId} ${event.fromVersion}-${event.toVersion}`, 'SYNC')

        source.initialized = false
        source.depth.push(data)

        this.onEvent({ type: 'offline', symbol })

        sleep(2000).then(() => {
          this.logger.warn(`Reboot "${symbol}"`, 'RESTART')
          this.setup(symbol)
        })

        return
      }

      this.onEvent({
        type: 'update',
        symbol,
        latency: Date.now() - +data.sendTime,
        bids: formatOrders(event.bids).sort((a, b) => a[0] - b[0]),
        asks: formatOrders(event.asks).sort((a, b) => a[0] - b[0])
      })

      source.lastUpdateId = +event.toVersion
    } else {
      source.depth.push(data)
    }
  }

  private async setup(symbol: string) {
    this.logger.log(`Initializing "${symbol}" orderbook...`, 'SETUP')

    const snapshot = await this.api.getOrderBookSnapshot(symbol)

    const orderbook = new OrderBookServer()
    const source = this.store[symbol]

    orderbook.update({
      updateId: snapshot.lastUpdateId,
      bids: snapshot.bids,
      asks: snapshot.asks
    })

    const index = source.depth.findIndex(({ publicAggreDepths: { fromVersion, toVersion } }, i) => {
      if (i === 0 && +fromVersion > snapshot.lastUpdateId) {
        return true
      }

      return snapshot.lastUpdateId >= +fromVersion && snapshot.lastUpdateId <= +toVersion
    })

    if (index !== -1) {
      source.depth.slice(index).forEach(({ publicAggreDepths: data }) => {
        orderbook.update({
          updateId: +data.toVersion,
          asks: formatOrders(data.asks),
          bids: formatOrders(data.bids)
        })
      })
    }

    const state = orderbook.getSnapshot()

    source.depth = []
    source.initialized = true
    source.lastUpdateId = state.lastUpdateId

    this.logger.verbose(`Orderbook initialized: ${symbol}`, 'SETUP')

    this.onEvent({
      type: 'snapshot',
      symbol,
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

      await this.ws.subscribe(({ diffBookDepth }) => diffBookDepth({ symbol, speed: 100 }))
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
      await this.ws.unsubscribe(({ diffBookDepth }) => diffBookDepth({ symbol, speed: 100 }))
    }
  }
}

const formatOrders = (values: { price: string; quantity: string }[] = []) => {
  return values.map(({ price, quantity }) => [+price, +quantity]) as [number, number][]
}
