import { ExchangeStream } from '../../broker'
import { MexcFuturesApi } from './api/futures/api'
import { MexcSpotApi } from './api/spot/api'
import { MexcFuturesDepth } from './orderbook.futures'
import { MexcSpotDepth } from './orderbook.spot'
import { MexcSpotPublicStream } from './ws/public-spot'
import { MexcFuturesPublicStream } from './ws/public-futures'
import { MexcMessages } from './ws/public-spot/messages'

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

export const createMexcSpotStream = (api: MexcSpotApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new MexcSpotPublicStream({
      onBroken: (streams) => {
        console.log('broken', streams)
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

        if (params.stream === 'trade') {
          await stream.subscribe(({ trades }) => trades({ symbol: params.symbol, speed: 100 }))
        }

        if (params.stream === 'kline') {
          await stream.subscribe(({ kline }) => kline({ symbol: params.symbol, interval: 'Min1' }))
        }
      },
      unsubscribe: async (params) => {
        if (params.stream === 'depth') {
          await depthService.stop(params.symbols)
        }

        if (params.stream === 'trade') {
          await stream.unsubscribe(({ trades }) => trades({ symbol: params.symbol, speed: 100 }))
        }

        if (params.stream === 'kline') {
          await stream.unsubscribe(({ kline }) => kline({ symbol: params.symbol, interval: 'Min1' }))
        }
      }
    }
  }
}

export const createMexcFuturesStream = (api: MexcFuturesApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new MexcFuturesPublicStream({
      onBroken: (streams) => {
        console.log('broken', streams)
      },
      onMessage: (message) => {
        depthService.update(message)
      }
    })

    const depthService = new MexcFuturesDepth({ api, stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          await depthService.initialize(subscription.symbols)
        }
      },
      unsubscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          await depthService.stop(subscription.symbols)
        }
      }
    }
  }
}
