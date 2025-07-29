import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { BitmartFuturesDepth } from './orderbook.futures'
import { BitmartSpotDepth } from './orderbook.spot'
import { BitmartFuturesStream } from './ws/futures/stream'
import { BitmartSpotStream } from './ws/spot/stream'
import { BitmartSpotMessages } from './ws/spot/messages'
import { BitmartFuturesMessages } from './ws/futures/messages'

export const createBitmartStream = (): ExchangeStream => {
  const [createSpot, createFutures] = [createBitmartSpotStream(), createBitmartFuturesStream()]

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

const createBitmartSpotStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new BitmartSpotStream({
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
        if (message.table.startsWith('spot/depth')) {
          depthService.update(message as BitmartSpotMessages.OrderBook)
        }

        if (message.table.startsWith('spot/kline')) {
          const update = message as BitmartSpotMessages.Kline
          const data = update.data[0]

          return onEvent('spot', {
            type: 'kline',
            symbol: data.symbol,
            event: {
              time: +data.candle[0] * 1000,
              high: +data.candle[2],
              open: +data.candle[1],
              low: +data.candle[3],
              close: +data.candle[4],
              volume: +data.candle[5],
              quoteVolume: +data.candle[5] * +data.candle[4]
            }
          })
        }
      }
    })

    const depthService = new BitmartSpotDepth({ stream }, (symbol, event) => {
      onEvent('spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({ interval: data.interval, symbol: data.symbol })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({ interval: data.interval, symbol: data.symbol })
          })
        }
      }
    }
  }
}

const createBitmartFuturesStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new BitmartFuturesStream({
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
        if (message.group.startsWith('futures/depthIncrease')) {
          depthService.update(message as BitmartFuturesMessages.OrderBook)
        }

        if (message.group.startsWith('futures/klineBin')) {
          const update = message as BitmartFuturesMessages.Kline

          return onEvent('futures', {
            type: 'kline',
            symbol: update.data.symbol,
            event: {
              time: update.data.ts * 1000,
              open: +update.data.o,
              high: +update.data.h,
              low: +update.data.l,
              close: +update.data.c,
              volume: +update.data.v,
              quoteVolume: +update.data.v * +update.data.c
            }
          })
        }
      }
    })

    const depthService = new BitmartFuturesDepth({ stream }, (symbol, event) => {
      onEvent('futures', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({ interval: data.interval, symbol: data.symbol })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({ interval: data.interval, symbol: data.symbol })
          })
        }
      }
    }
  }
}
