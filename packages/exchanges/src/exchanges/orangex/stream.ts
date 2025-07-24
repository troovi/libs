import { ExchangeStream } from '../../broker'
import { OrangeXApi } from './api'
import { OrangeXDepth } from './orderbook'
import { OrangeXPublicStream } from './ws/public/stream'

export const createOrangeXStream = (api: OrangeXApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new OrangeXPublicStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message.params)
      }
    })

    const orderbook = new OrangeXDepth({ api, stream }, (symbol, event) => {
      onEvent(symbol.endsWith('-PERPETUAL') ? 'futures' : 'spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return orderbook.initialize(data.symbols)
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return orderbook.stop(data.symbols)
        }
      }
    }
  }
}
