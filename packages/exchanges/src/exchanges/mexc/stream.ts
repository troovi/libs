import { ExchangeStream } from '../../broker'
import { MexcFuturesApi } from './api/futures/api'
import { MexcSpotApi } from './api/spot/api'
import { MexcFuturesDepth } from './orderbook.futures'
import { MexcSpotDepth } from './orderbook.spot'
import { MexcSpotPublicStream } from './ws/public-spot'
import { MexcFuturesPublicStream } from './ws/public-futures'
import { MexcMessages } from './ws/public-spot/messages'
import { reboot } from '../../stream-manager'

export const createMexcStream = (sapi: MexcSpotApi, fapi: MexcFuturesApi): ExchangeStream => {
  const [createSpot, createFutures] = [createMexcSpotStream(sapi), createMexcFuturesStream(fapi)]

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

const createMexcSpotStream = (api: MexcSpotApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new MexcSpotPublicStream({
      onBroken: async (channels) => {
        const orderbooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'diffBookDepth') {
            depthService.break(info.params.symbol)
            orderbooks.push(info.params.symbol)

            return false
          }
        })

        await depthService.initialize(orderbooks)
      },
      onMessage: (data) => {
        if (data.channel.startsWith('spot@public.aggre.depth')) {
          depthService.update(data as MexcMessages.depthUpdate)
          return
        }

        if (data.channel.startsWith('spot@public.aggre.deals')) {
          const update = data as MexcMessages.tradeUpdate

          return onEvent('spot', {
            type: 'trade',
            symbol: data.symbol,
            event: update.publicAggreDeals.deals.map((trade) => ({
              time: +trade.time,
              price: trade.price,
              quantity: trade.quantity,
              isSeller: trade.tradeType === 2
            }))
          })
        }

        if (data.channel.startsWith('spot@public.kline')) {
          const { publicSpotKline: e } = data as MexcMessages.klineUpdate

          return onEvent('spot', {
            type: 'kline',
            symbol: data.symbol,
            event: {
              time: +e.windowStart * 1000,
              high: +e.highestPrice,
              low: +e.lowestPrice,
              close: +e.closingPrice,
              open: +e.openingPrice,
              volume: +e.volume,
              quoteVolume: +e.amount
            }
          })
        }
      }
    })

    const depthService = new MexcSpotDepth({ api, stream }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (params) => {
        if (params.stream === 'depth') {
          await depthService.initialize(params.symbols)
        }

        if (params.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({ symbol: params.symbol, interval: 'Min1' })
          })
        }

        if (params.stream === 'trade') {
          await stream.subscribe('trades', (createStream) => {
            return createStream({ symbol: params.symbol, speed: 100 })
          })
        }
      },
      unsubscribe: async (params) => {
        if (params.stream === 'depth') {
          await depthService.stop(params.symbols)
        }

        if (params.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({ symbol: params.symbol, interval: 'Min1' })
          })
        }

        if (params.stream === 'trade') {
          await stream.unsubscribe('trades', (createStream) => {
            return createStream({ symbol: params.symbol, speed: 100 })
          })
        }
      }
    }
  }
}

const createMexcFuturesStream = (api: MexcFuturesApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new MexcFuturesPublicStream({
      onBroken: async (channels) => {
        const orderbooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'orderbook') {
            depthService.break(info.params)
            orderbooks.push(info.params)

            return false
          }
        })

        await depthService.initialize(orderbooks)
      },
      onMessage: (message) => {
        if (message.channel === 'push.depth') {
          depthService.update(message)
        }

        if (message.channel === 'push.kline') {
          return onEvent('futures', {
            type: 'kline',
            symbol: message.symbol,
            event: {
              time: message.data.t * 1000,
              high: message.data.h,
              open: message.data.o,
              low: message.data.l,
              close: message.data.c,
              volume: message.data.q,
              quoteVolume: message.data.a
            }
          })
        }
      }
    })

    const depthService = new MexcFuturesDepth({ api, stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          return stream.subscribe('kline', (createStream) => {
            return createStream({
              symbol: data.symbol,
              interval: ({ '1m': 'Min1', '5m': 'Min5' } as const)[data.interval]
            })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          return stream.unsubscribe('kline', (createStream) => {
            return createStream({
              symbol: data.symbol,
              interval: ({ '1m': 'Min1', '5m': 'Min5' } as const)[data.interval]
            })
          })
        }
      }
    }
  }
}
