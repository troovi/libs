import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    orderbook: (symbol: string) => {
      return JSON.stringify({ method: 'depth', param: { symbol } })
    }
  },
  getSubscriptions: ([stream]) => {
    return JSON.parse(stream) as { method: string; param: object }
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as { method: string; param: any }

    if (data.method === 'depth') {
      return { subscription: 'orderbook', params: data.param.symbol }
    }

    throw `invalid mexc stream: ${stream}`
  }
})
