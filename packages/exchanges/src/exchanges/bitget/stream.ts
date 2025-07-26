import { reboot } from '../../reboot'
import { ExchangeStream } from '../../broker'
import { BitgetDepth } from './orderbook'
import { BitgetPublicStream } from './ws/public/stream'

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
        depthService.update(message)
      }
    })

    const depthService = new BitgetDepth({ stream }, (symbol, market, event) => {
      onEvent(market, { type: 'depth', symbol, event })
    })

    return {
      subscribe: async ({ market, ...data }) => {
        if (data.stream === 'depth') {
          if (market === 'spot') {
            return depthService.initialize(data.symbols, 'SPOT')
          }

          if (market === 'futures') {
            return depthService.initialize(data.symbols, 'USDT-FUTURES')
          }
        }
      },
      unsubscribe: async ({ market, ...data }) => {
        if (data.stream === 'depth') {
          if (market === 'spot') {
            return depthService.stop(data.symbols, 'SPOT')
          }

          if (market === 'futures') {
            return depthService.stop(data.symbols, 'USDT-FUTURES')
          }
        }
      }
    }
  }
}
