import { ExchangeStream } from '../../broker'
import { BitgetDepth } from './orderbook'
import { BitgetPublicStream } from './ws/public/stream'

export const createBitgetStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new BitgetPublicStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new BitgetDepth({ stream }, (symbol, event) => {
      onEvent(orderbook.getSymbolMarket(symbol), { type: 'depth', symbol, event })
    })

    return {
      subscribe: async ({ market, ...data }) => {
        if (data.stream === 'depth') {
          if (market === 'spot') {
            return orderbook.initialize(data.symbols, 'SPOT')
          }

          if (market === 'futures') {
            return orderbook.initialize(data.symbols, 'USDT-FUTURES')
          }
        }
      },
      unsubscribe: async ({ market, ...data }) => {
        if (data.stream === 'depth') {
          if (market === 'spot') {
            return orderbook.stop(data.symbols, 'SPOT')
          }

          if (market === 'futures') {
            return orderbook.stop(data.symbols, 'USDT-FUTURES')
          }
        }
      }
    }
  }
}
