import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    orderbook: (instId: string) => {
      return JSON.stringify({ channel: 'books', instId })
    }
  },
  getSubscriptions: ([stream]) => {
    return JSON.parse(stream) as object
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as { channel: string; instId: string }

    if (data.channel === 'books') {
      return { subscription: 'orderbook', params: data.instId }
    }

    throw `invalid okx stream: ${stream}`
  }
})
