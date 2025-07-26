import { reboot } from '../../reboot'
import { ExchangeStream } from '../../broker'
import { OKXDepth } from './orderbook'
import { OKXPublicStream } from './ws/public/stream'

export const createOKXStream = (): ExchangeStream => {
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
        depthService.update(message)
      }
    })

    const depthService = new OKXDepth({ stream }, (symbol, event) => {
      onEvent(symbol.endsWith('-SWAP') ? 'futures' : 'spot', { type: 'depth', symbol, event })
    })

    return {
      subscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return depthService.initialize(subscription.symbols)
        }
      },
      unsubscribe: async (subscription) => {
        if (subscription.stream === 'depth') {
          return depthService.stop(subscription.symbols)
        }
      }
    }
  }
}
