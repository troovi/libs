import { reboot } from '../../reboot'
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
      onBroken: async (channels) => {
        const orderbooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'orderbook') {
            depthService.break(info.params.symbol)
            orderbooks.push(info.params.symbol)

            return false
          }
        })

        await depthService.initialize(orderbooks)
      },
      onMessage: (message) => {
        depthService.update(message)
      }
    })

    const depthService = new GateSpotDepth({ stream, api }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return depthService.initialize(subscription.symbols)
        }
      },
      unsubscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return depthService.stop(subscription.symbols)
        }
      }
    }
  }
}

const createGateFuturesStream = (api: GateApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new GateFuturesStream({
      onBroken: async (channels) => {
        const orderbooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'orderbook') {
            depthService.break(info.params.symbol)
            orderbooks.push(info.params.symbol)

            return false
          }
        })

        await depthService.initialize(orderbooks)
      },
      onMessage: (message) => {
        depthService.update(message)
      }
    })

    const depthService = new GateFuturesDepth({ stream, api }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return depthService.initialize(subscription.symbols)
        }
      },
      unsubscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return depthService.stop(subscription.symbols)
        }
      }
    }
  }
}
