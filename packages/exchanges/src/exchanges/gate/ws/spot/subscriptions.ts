import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    orderbook: ({ symbol }: { symbol: string }) => {
      return JSON.stringify({
        channel: 'spot.order_book_update',
        payload: [symbol, '100ms'] // 100ms | 20ms
      })
    },
    candlestick: (data: { symbol: string; interval: '1m' | '5m' }) => {
      return JSON.stringify({
        channel: 'spot.candlesticks',
        payload: [data.interval, data.symbol]
      })
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

    if (data.channel === 'spot.candlesticks') {
      const [interval, symbol] = data.payload as ['1m' | '5m', string]

      return { subscription: 'candlestick', params: { symbol, interval } }
    }

    throw `invalid gate stream: ${stream}`
  }
})
