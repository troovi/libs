import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    orderbook: (data: { symbol: string; speed: '100ms' | '20ms'; level: '100' | '50' | '20' }) => {
      return JSON.stringify({
        channel: 'futures.order_book_update',
        payload: [data.symbol, data.speed, data.level]
      })
    },
    candlestick: (data: { symbol: string; interval: '1m' | '5m' }) => {
      return JSON.stringify({
        channel: 'futures.candlesticks',
        payload: [data.interval, data.symbol]
      })
    }
  },
  getSubscriptions([stream]) {
    return JSON.parse(stream) as Record<string, unknown>
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as { channel: string; payload: string[] }

    if (data.channel === 'futures.order_book_update') {
      const [symbol, speedStr, levelStr] = data.payload
      const speed = speedStr as '100ms' | '20ms'
      const level = levelStr as '100' | '50' | '20'

      if (speed !== '100ms' && speed !== '20ms') {
        throw `invalid: ${stream}`
      }

      if (level !== '100' && level !== '50' && level !== '20') {
        throw `invalid: ${stream}`
      }

      return { subscription: 'orderbook', params: { symbol, speed, level } }
    }

    if (data.channel === 'futures.candlesticks') {
      const [interval, symbol] = data.payload as ['1m' | '5m', string]

      return { subscription: 'candlestick', params: { symbol, interval } }
    }

    throw `invalid gate stream: ${stream}`
  }
})
