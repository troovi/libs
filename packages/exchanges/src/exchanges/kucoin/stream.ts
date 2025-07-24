import { ExchangeStream } from '../../broker'
import { KuCoinFuturesApi } from './api/futures/api'
import { KuCoinSpotApi } from './api/spot/api'
import { KuCoinFuturesSnapshot } from './snapshot.futures'
import { KuCoinSpotSnapshot } from './snapshot.spot'
import { KuCoinFuturesMessages } from './ws/futures/messages'
import { KuCoinFuturesPublicStream } from './ws/futures/stream'
import { KuCoinSpotMessages } from './ws/spot/messages'
import { KuCoinSpotPublicStream } from './ws/spot/stream'

export const createKuCoinStream = (sapi: KuCoinSpotApi, fapi: KuCoinFuturesApi): ExchangeStream => {
  const [createSpot, createFutures] = [createKuCoinSpotStream(sapi), createKuCoinFuturesStream(fapi)]

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

const createKuCoinSpotStream = (api: KuCoinSpotApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new KuCoinSpotPublicStream({
      api,
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        if (message.topic.startsWith('/spotMarket/level2Depth50')) {
          orderbook.update(message as KuCoinSpotMessages.Depth50)
          return
        }
      }
    })

    const orderbook = new KuCoinSpotSnapshot({ stream }, (symbol, event) => {
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

const createKuCoinFuturesStream = (api: KuCoinFuturesApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new KuCoinFuturesPublicStream({
      api,
      onBroken(streams) {
        console.log('broken:', streams)
      },
      onMessage: (message) => {
        if (message.topic.startsWith('/contractMarket/level2Depth50')) {
          orderbook.update(message as KuCoinFuturesMessages.Depth50)
        }
      }
    })

    const orderbook = new KuCoinFuturesSnapshot({ stream }, (symbol, event) => {
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
