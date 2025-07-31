import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { BitgetDepth } from './orderbook'
import { BitgetPublicStream } from './ws/public/stream'
import { BitgetPublicMessages } from './ws/public/messages'

export const createBitgetStream = (): ExchangeStream => {
  return (onEvent) => {
    const stream = new BitgetPublicStream({
      onBroken: async (channels) => {
        const spotBooks: string[] = []
        const futuresBooks: string[] = []

        await reboot(stream, channels, (info) => {
          if (info.subscription === 'orderbook') {
            depthService.break(info.params.instId, info.params.instType)

            if (info.params.instType === 'SPOT') {
              spotBooks.push(info.params.instId)
            }

            if (info.params.instType === 'USDT-FUTURES') {
              futuresBooks.push(info.params.instId)
            }

            return false
          }
        })

        await depthService.initialize(spotBooks, 'SPOT')
        await depthService.initialize(futuresBooks, 'USDT-FUTURES')
      },
      onMessage: (message) => {
        if (message.arg.channel === 'books') {
          depthService.update(message as BitgetPublicMessages.OrderBook)
        }

        if (message.arg.channel.startsWith('candle')) {
          const update = message as BitgetPublicMessages.Candle

          if (update.action === 'update') {
            const data = update.data[0]

            return onEvent(update.arg.instType === 'SPOT' ? 'spot' : 'futures', {
              type: 'kline',
              symbol: update.arg.instId,
              event: {
                time: +data[0],
                high: +data[2],
                open: +data[1],
                low: +data[3],
                close: +data[4],
                volume: +data[5],
                quoteVolume: +data[6]
              }
            })
          }
        }
      }
    })

    const depthService = new BitgetDepth({ stream }, (symbol, market, event) => {
      onEvent(market, { type: 'depth', symbol, event })
    })

    return {
      subscribe: async ({ market, ...data }) => {
        if (data.stream === 'depth') {
          return depthService.initialize(data.symbols, market === 'spot' ? 'SPOT' : 'USDT-FUTURES')
        }

        if (data.stream === 'kline') {
          return stream.subscribe('candle', (createStream) => {
            return createStream({
              interval: data.interval,
              instId: data.symbol,
              instType: market === 'spot' ? 'SPOT' : 'USDT-FUTURES'
            })
          })
        }
      },
      unsubscribe: async ({ market, ...data }) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols, market === 'spot' ? 'SPOT' : 'USDT-FUTURES')
        }

        if (data.stream === 'kline') {
          return stream.unsubscribe('candle', (createStream) => {
            return createStream({
              interval: data.interval,
              instId: data.symbol,
              instType: market === 'spot' ? 'SPOT' : 'USDT-FUTURES'
            })
          })
        }
      }
    }
  }
}
