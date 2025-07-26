import { reboot } from '../../reboot'
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

    const depthService = new CoinExDepth({ stream }, (symbol, event) => {
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

const createCoinExFuturesStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new CoinExStream('futures', {
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

    const depthService = new CoinExDepth({ stream }, (symbol, event) => {
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
