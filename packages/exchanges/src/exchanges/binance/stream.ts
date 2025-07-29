import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { BinanceFuturesApi } from './api/futures/api'
import { BinanceSpotApi } from './api/spot/api'
import { BinanceFuturesDepth } from './orderbook.futures'
import { BinanceSpotDepth } from './orderbook.spot'
import { BinancePublicStream } from './ws/public/stream'

export const createBinanceStream = (sapi: BinanceSpotApi, fapi: BinanceFuturesApi): ExchangeStream => {
  const [createSpot, createFutures] = [createBinanceSpotStream(sapi), createBinanceFuturesStream(fapi)]

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

const createBinanceSpotStream = (api: BinanceSpotApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new BinancePublicStream('spot', {
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
        if (data.e === 'depthUpdate') {
          depthService.update(data)
        }

        if (data.e === 'kline') {
          return onEvent('spot', {
            type: 'kline',
            symbol: data.s,
            event: {
              time: data.k.t,
              high: +data.k.h,
              close: +data.k.c,
              low: +data.k.l,
              open: +data.k.o,
              volume: +data.k.v,
              quoteVolume: +data.k.q
            }
          })
        }
      }
    })

    const depthService = new BinanceSpotDepth({ api, stream }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      }
    }
  }
}

const createBinanceFuturesStream = (api: BinanceFuturesApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new BinancePublicStream('futures', {
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
        if (data.e === 'depthUpdate') {
          depthService.update(data)
        }

        if (data.e === 'kline') {
          return onEvent('futures', {
            type: 'kline',
            symbol: data.s,
            event: {
              time: data.k.t,
              high: +data.k.h,
              close: +data.k.c,
              low: +data.k.l,
              open: +data.k.o,
              volume: +data.k.v,
              quoteVolume: +data.k.q
            }
          })
        }
      }
    })

    const depthService = new BinanceFuturesDepth({ api, stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      }
    }
  }
}
