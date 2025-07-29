import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: false,
  streams: {
    candlestick: ({ instId, interval }: { instId: string; interval: '1m' | '5m' }) => {
      return JSON.stringify({ channel: `candle${interval}`, instId })
    }
  },
  getSubscriptions: ([stream]) => {
    return JSON.parse(stream) as object
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as { channel: string; instId: string }

    if (data.channel.startsWith('candle')) {
      return {
        subscription: 'candlestick',
        params: {
          instId: data.instId,
          interval: data.channel.split('candle')[1] as '1m' | '5m'
        }
      }
    }

    throw `invalid okx stream: ${stream}`
  }
})
