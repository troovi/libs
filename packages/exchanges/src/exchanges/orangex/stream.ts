import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { OrangeXApi } from './api'
import { OrangeXDepth } from './orderbook'
import { OrangeXPublicStream } from './ws/public/stream'
import { OrangeXPublicMessages } from './ws/public/messages'

export const createOrangeXStream = (api: OrangeXApi): ExchangeStream => {
  return (onEvent) => {
    const stream = new OrangeXPublicStream({
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
        if (message.params.channel.startsWith('book')) {
          depthService.update(message.params as OrangeXPublicMessages.OrderBook)
        }

        if (message.params.channel.startsWith('chart.trades')) {
          const update = message.params as OrangeXPublicMessages.Kline
          const symbol = update.channel.split('.')[2]

          onEvent(symbol.endsWith('-PERPETUAL') ? 'futures' : 'spot', {
            type: 'kline',
            symbol,
            event: {
              time: +update.data.tick * 1000,
              open: +update.data.open,
              high: +update.data.high,
              low: +update.data.low,
              close: +update.data.close,
              volume: +update.data.volume,
              quoteVolume: +update.data.close
            }
          })
        }
      }
    })

    const depthService = new OrangeXDepth({ api, stream }, (symbol, event) => {
      onEvent(symbol.endsWith('-PERPETUAL') ? 'futures' : 'spot', { type: 'depth', symbol, event })
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
