import { ExchangeStream } from '../../broker'
import { KuCoinFuturesApi } from './api/futures/api'
import { KuCoinSpotApi } from './api/spot/api'
import { KuCoinFuturesSnapshot } from './snapshot.futures'
import { KuCoinSpotSnapshot } from './snapshot.spot'
import { KuCoinFuturesMessages } from './ws/futures/messages'
import { KuCoinFuturesPublicStream } from './ws/futures/stream'
import { KuCoinSpotMessages } from './ws/spot/messages'
import { KuCoinSpotPublicStream } from './ws/spot/stream'
import { reboot } from '../../stream-manager'

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
      onBroken: async (channels) => {
        const orderbooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'orderbook50') {
            depthService.break(info.params.symbol)
            orderbooks.push(info.params.symbol)

            return false
          }
        })

        await depthService.initialize(orderbooks)
      },
      onMessage: (message) => {
        if (message.topic.startsWith('/spotMarket/level2Depth50:')) {
          depthService.update(message as KuCoinSpotMessages.Depth50)
        }

        if (message.topic.startsWith('/market/candles:')) {
          const { data } = message as unknown as KuCoinSpotMessages.Kline

          onEvent('spot', {
            type: 'kline',
            symbol: data.symbol,
            event: {
              time: +data.candles[0] * 1000,
              open: +data.candles[1],
              close: +data.candles[2],
              high: +data.candles[3],
              low: +data.candles[4],
              volume: +data.candles[5],
              quoteVolume: +data.candles[6]
            }
          })

          return
        }
      }
    })

    const depthService = new KuCoinSpotSnapshot({ stream }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({
              symbol: data.symbol,
              interval: ({ '1m': '1min', '5m': '5min' } as const)[data.interval]
            })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({
              symbol: data.symbol,
              interval: ({ '1m': '1min', '5m': '5min' } as const)[data.interval]
            })
          })
        }
      }
    }
  }
}

const createKuCoinFuturesStream = (api: KuCoinFuturesApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new KuCoinFuturesPublicStream({
      api,
      onBroken: async (channels) => {
        const orderbooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'orderbook50') {
            depthService.break(info.params.symbol)
            orderbooks.push(info.params.symbol)

            return false
          }
        })

        await depthService.initialize(orderbooks)
      },
      onMessage: (message) => {
        if (message.topic.startsWith('/contractMarket/level2Depth50:')) {
          depthService.update(message as KuCoinFuturesMessages.Depth50)
        }

        if (message.topic.startsWith('/contractMarket/limitCandle:')) {
          const { data } = message as KuCoinFuturesMessages.Kline

          onEvent('futures', {
            type: 'kline',
            symbol: data.symbol,
            event: {
              time: +data.candles[0] * 1000,
              open: +data.candles[1],
              close: +data.candles[2],
              high: +data.candles[3],
              low: +data.candles[4],
              volume: +data.candles[5],
              quoteVolume: +data.candles[6]
            }
          })
        }
      }
    })

    const depthService = new KuCoinFuturesSnapshot({ stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({
              symbol: data.symbol,
              interval: ({ '1m': '1min', '5m': '5min' } as const)[data.interval]
            })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({
              symbol: data.symbol,
              interval: ({ '1m': '1min', '5m': '5min' } as const)[data.interval]
            })
          })
        }
      }
    }
  }
}
