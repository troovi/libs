import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    // https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
    orderbook: (symbol: string) => {
      return `spot/depth/increase100:${symbol}`
    },
    // https://developer-pro.bitmart.com/en/spot/#public-kline-channel
    kline: ({ interval, symbol }: { interval: '1m' | '5m'; symbol: string }) => {
      return `spot/kline${interval}:${symbol}`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith(`spot/depth/increase100:`)) {
      return { subscription: 'orderbook', params: stream.split('spot/depth/increase100:')[1] }
    }

    if (stream.startsWith(`spot/kline`)) {
      const [interval, symbol] = stream.split('spot/kline')[1].split(':')

      return { subscription: 'kline', params: { interval: interval as '1m' | '5m', symbol } }
    }

    throw `invalid bitmart stream: ${stream}`
  }
})
