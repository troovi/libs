import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { CoinExDepth } from './orderbook'
import { CoinExStream } from './ws/stream'
import { CoinExKline } from './kline'

export const createCoinExStream = (): ExchangeStream => {
  const [createSpot, createFutures] = [createStream('spot'), createStream('futures')]

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

const createStream = (market: 'spot' | 'futures'): ExchangeStream => {
  return (onEvent) => {
    const stream = new CoinExStream(market, {
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
        if (message.method === 'depth.update') {
          depthService.update(message)
        }

        if (message.method === 'state.update') {
          klineService.update(market, message)
        }
      }
    })

    const depthService = new CoinExDepth({ stream }, (symbol, event) => {
      onEvent(market, { type: 'depth', symbol, event })
    })

    const klineService = new CoinExKline({ stream }, ({ symbol, market, event }) => {
      onEvent(market, { type: 'kline', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          return klineService.subscribe({ symbol: data.symbol, interval: data.interval, market })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          return klineService.unsubscribe({ symbol: data.symbol, interval: data.interval, market })
        }
      }
    }
  }
}
