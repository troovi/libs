import { ExchangeStream } from '../../broker'
import { BitmartFuturesDepth } from './orderbook.futures'
import { BitmartSpotDepth } from './orderbook.spot'
import { BitmartFuturesStream } from './ws/futures/stream'
import { BitmartSpotStream } from './ws/spot/stream'

export const createBitmartStream = (): ExchangeStream => {
  const [createSpot, createFutures] = [createBitmartSpotStream(), createBitmartFuturesStream()]

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

const createBitmartSpotStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new BitmartSpotStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new BitmartSpotDepth({ stream }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
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

const createBitmartFuturesStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new BitmartFuturesStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new BitmartFuturesDepth({ stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
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
