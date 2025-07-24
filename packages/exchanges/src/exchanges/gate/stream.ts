import { ExchangeStream } from '../../broker'
import { GateApi } from './api'
import { GateFuturesDepth } from './orderbook.futures'
import { GateSpotDepth } from './orderbook.spot'
import { GateFuturesStream } from './ws/futures/stream'
import { GateSpotStream } from './ws/spot/stream'

export const createGateStream = (api: GateApi): ExchangeStream => {
  const [createSpot, createFutures] = [createGateSpotStream(api), createGateFuturesStream(api)]

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

const createGateSpotStream = (api: GateApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new GateSpotStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new GateSpotDepth({ stream, api }, (symbol, event) => {
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

const createGateFuturesStream = (api: GateApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new GateFuturesStream({
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        orderbook.update(message)
      }
    })

    const orderbook = new GateFuturesDepth({ stream, api }, (symbol, event) => {
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
