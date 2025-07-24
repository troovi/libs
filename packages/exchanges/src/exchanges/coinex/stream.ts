import { ExchangeStream } from '../../broker'
import { CoinExDepth } from './orderbook'
import { CoinExStream } from './ws/stream'

export const createCoinExStream = (): ExchangeStream => {
  const [createSpot, createFutures] = [createCoinExSpotStream(), createCoinExFuturesStream()]

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

const createCoinExSpotStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new CoinExStream('spot', {
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new CoinExDepth({ stream }, (symbol, event) => {
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

const createCoinExFuturesStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new CoinExStream('futures', {
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new CoinExDepth({ stream }, (symbol, event) => {
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
