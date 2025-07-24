import { ExchangeStream } from '../../broker'
import { ByBitDepth } from './orderbook'
import { ByBitStream } from './ws/public/stream'

export const createByBitStream = (): ExchangeStream => {
  const [createSpot, createFutures] = [createByBitSpotStream(), createByBitFuturesStream()]

  return (onEvent) => {
    const [spotStream, futuresStream] = [createSpot(onEvent), createFutures(onEvent)]

    return {
      subscribe: async (data) => {
        if (data.market === 'spot') {
          return spotStream.subscribe(data)
        }

        if (data.market === 'futures') {
          return futuresStream.subscribe(data)
        }
      },
      unsubscribe: async (data) => {
        if (data.market === 'spot') {
          return spotStream.unsubscribe(data)
        }

        if (data.market === 'futures') {
          return futuresStream.unsubscribe(data)
        }
      }
    }
  }
}

const createByBitSpotStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new ByBitStream('spot', {
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new ByBitDepth({ stream }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
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

const createByBitFuturesStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new ByBitStream('linear', {
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new ByBitDepth({ stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
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
