import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { OKXDepth } from './orderbook'
import { OKXPublicStream } from './ws/public/stream'
import { OKXBusinessStream } from './ws/business/stream'
import { OKXPublicMessages } from './ws/public/messages'
import { OKXBusinessMessages } from './ws/business/messages'

export const createOKXStream = (): ExchangeStream => {
  const [createPublicStream, createBusinessStream] = [
    createOKXPublicStream(),
    createOKXBusinessStream()
  ]

  return (onEvent) => {
    const [publicStream, businessStream] = [createPublicStream(onEvent), createBusinessStream(onEvent)]

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return publicStream.subscribe(data)
        }

        if (data.stream === 'kline') {
          return businessStream.subscribe(data)
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return publicStream.unsubscribe(data)
        }

        if (data.stream === 'kline') {
          return businessStream.unsubscribe(data)
        }
      }
    }
  }
}

const createOKXPublicStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new OKXPublicStream({
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
        if (message.arg.channel === 'books') {
          depthService.update(message as OKXPublicMessages.Books)
        }
      }
    })

    const depthService = new OKXDepth({ stream }, (symbol, event) => {
      onEvent(symbol.endsWith('-SWAP') ? 'futures' : 'spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols)
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }
      }
    }
  }
}

const createOKXBusinessStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new OKXBusinessStream({
      onBroken: (channels) => {
        reboot(stream, channels)
      },
      onMessage: (message) => {
        if (message.arg.channel.startsWith('candle')) {
          const update = message as OKXBusinessMessages.Candle
          const data = update.data[0]

          onEvent(update.arg.instId.endsWith('-SWAP') ? 'futures' : 'spot', {
            type: 'kline',
            symbol: update.arg.instId,
            event: {
              time: +data[0],
              open: +data[1],
              high: +data[2],
              low: +data[3],
              close: +data[4],
              volume: +data[5],
              quoteVolume: +data[6]
            }
          })
        }
      }
    })

    return {
      subscribe: async (data) => {
        if (data.stream === 'kline') {
          await stream.subscribe('candlestick', (createStream) => {
            return createStream({ instId: data.symbol, interval: data.interval })
          })
        }
      },
      unsubscribe: async (data) => {
        if (data.stream === 'kline') {
          await stream.unsubscribe('candlestick', (createStream) => {
            return createStream({ instId: data.symbol, interval: data.interval })
          })
        }
      }
    }
  }
}
