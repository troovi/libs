import { reboot } from '../../stream-manager'
import { ExchangeStream } from '../../broker'
import { OrangeXApi } from './api'
import { OrangeXDepth } from './orderbook'
import { OrangeXPublicStream } from './ws/public/stream'

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
        depthService.update(message.params)
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
      },
      unsubscribe: async (data) => {
        if (data.stream === 'depth') {
          return depthService.stop(data.symbols)
        }
      }
    }
  }
}
