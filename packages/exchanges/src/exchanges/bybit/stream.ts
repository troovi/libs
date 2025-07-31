import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { ByBitDepth } from './orderbook'
import { ByBitStream } from './ws/public/stream'
import { ByBitMessages } from './ws/public/messages'

export const createByBitStream = (): ExchangeStream => {
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
    const stream = new ByBitStream(market === 'spot' ? 'spot' : 'linear', {
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
        if (message.topic.startsWith('orderbook')) {
          depthService.update(message as ByBitMessages.DepthEvent)
        }

        if (message.topic.startsWith('kline')) {
          const update = message as ByBitMessages.KlineEvent
          const symbol = update.topic.split('.')[2]
          const data = update.data[0]

          return onEvent(market, {
            type: 'kline',
            symbol,
            event: {
              time: data.start,
              high: +data.high,
              low: +data.low,
              close: +data.close,
              open: +data.open,
              volume: +data.volume,
              quoteVolume: +data.turnover
            }
          })
        }
      }
    })

    const depthService = new ByBitDepth({ stream }, (symbol, event) => {
      onEvent(market, { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.subscribe('kline', (createStream) => {
            return createStream({ symbol: data.symbol, interval: parseInt(data.interval) as 1 | 5 })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }

        if (data.stream === 'kline') {
          await stream.unsubscribe('kline', (createStream) => {
            return createStream({ symbol: data.symbol, interval: parseInt(data.interval) as 1 | 5 })
          })
        }
      }
    }
  }
}
