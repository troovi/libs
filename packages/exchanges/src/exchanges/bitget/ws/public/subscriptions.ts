import { StreamsManager } from '../../../../stream-manager'

// https://www.bitget.com/api-doc/common/websocket-intro

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: (data: { instType: 'USDT-FUTURES' | 'SPOT'; instId: string }) => {
      return JSON.stringify({
        instType: data.instType,
        channel: 'books',
        instId: data.instId
      })
    },
    candle: (data: { interval: '1m' | '5m'; instType: 'USDT-FUTURES' | 'SPOT'; instId: string }) => {
      return JSON.stringify({
        instType: data.instType,
        channel: `candle${data.interval}`,
        instId: data.instId
      })
    }
  },
  getSubscriptions: (streams) => {
    return streams.map((stream) => JSON.parse(stream)) as object[]
  },
  getStreamInfo: (stream) => {
    const data = JSON.parse(stream) as {
      instId: string
      instType: 'USDT-FUTURES' | 'SPOT'
      channel: string
    }

    if (data.channel === 'books') {
      return {
        subscription: 'orderbook',
        params: data
      }
    }

    if (data.channel.startsWith('candle')) {
      const interval = data.channel.split('candle')[1] as '1m' | '5m'

      return {
        subscription: 'candle',
        params: { interval, instId: data.instId, instType: data.instType }
      }
    }

    throw `invalid bitget stream: ${stream}`
  }
})
