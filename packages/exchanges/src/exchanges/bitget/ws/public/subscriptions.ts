import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: (data: { instType: 'USDT-FUTURES' | 'SPOT'; instId: string }) => {
      return JSON.stringify({ instType: data.instType, channel: 'books', instId: data.instId })
    }
  },
  getSubscriptions: (streams) => {
    return streams.map((stream) => JSON.parse(stream)) as object[]
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream)

    if (data.channel === 'books') {
      return { subscription: 'orderbook', params: data }
    }

    throw `invalid bitget stream: ${stream}`
  }
})
