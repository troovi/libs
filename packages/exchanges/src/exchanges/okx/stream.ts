import { ExchangeStream } from '../../broker'
import { OKXDepth } from './orderbook'
import { OKXPublicStream } from './ws/public/stream'

export const createOKXStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new OKXPublicStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new OKXDepth({ stream }, (symbol, event) => {
      onEvent(symbol.endsWith('-SWAP') ? 'futures' : 'spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return orderbook.initialize(subscription.symbols)
        }
      },
      unsubscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return orderbook.stop(subscription.symbols)
        }
      }
    }
  }
}
