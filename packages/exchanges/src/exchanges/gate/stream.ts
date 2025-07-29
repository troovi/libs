import { reboot } from '../../stream-manager'
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
        if (message.channel === 'spot.order_book_update') {
          depthService.update(message)
        }

        if (message.channel === 'spot.candlesticks') {
          onEvent('spot', {
            type: 'kline',
            symbol: message.result.n.split('_').slice(1).join('_'),
            event: {
              time: +message.result.t * 1000,
              high: +message.result.h,
              low: +message.result.l,
              close: +message.result.c,
              open: +message.result.o,
              volume: +message.result.a,
              quoteVolume: +message.result.v
            }
          })
        }
      }
    })

    const depthService = new GateSpotDepth({ stream, api }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          return stream.subscribe('candlestick', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          return stream.unsubscribe('candlestick', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
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
        if (message.channel === 'futures.order_book_update') {
          depthService.update(message)
        }

        if (message.channel === 'futures.candlesticks') {
          message.result.forEach((update) => {
            onEvent('futures', {
              type: 'kline',
              symbol: update.n.split('_').slice(1).join('_'),
              event: {
                time: update.t * 1000,
                high: +update.h,
                low: +update.l,
                close: +update.c,
                open: +update.o,
                volume: +update.v,
                quoteVolume: +update.a
              }
            })
          })
        }
      }
    })

    const depthService = new GateFuturesDepth({ stream, api }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('candlestick', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('candlestick', (createStream) => {
            return createStream({ symbol: data.symbol, interval: data.interval })
          })
        }
      }
    }
  }
}
