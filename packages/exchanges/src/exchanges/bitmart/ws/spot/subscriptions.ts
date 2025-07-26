import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: (symbol: string) => {
      return `spot/depth/increase100:${symbol}`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith(`spot/depth/increase100:`)) {
      return { subscription: 'orderbook', params: stream.split('spot/depth/increase100:')[1] }
    }

    throw `invalid bitmart stream: ${stream}`
  }
})
