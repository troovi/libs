import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    orderbook: ({ symbol }: { symbol: string }) => {
      return JSON.stringify({ channel: 'spot.order_book_update', payload: [symbol, '100ms'] }) // 100ms | 20ms
    }
  },
  getSubscriptions: ([stream]) => {
    return JSON.parse(stream) as Record<string, unknown>
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as { channel: string; payload: string[] }

    if (data.channel === 'spot.order_book_update') {
      return { subscription: 'orderbook', params: { symbol: data.payload[0] } }
    }

    throw `invalid gate stream: ${stream}`
  }
})
