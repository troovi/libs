import { StreamsManager } from '../../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: (data: { symbol: string; level: 5 | 20 | 50; speed: 100 | 200 }) => {
      return `futures/depthIncrease${data.level}:${data.symbol}@${data.speed}ms`
    }
  },
  getSubscriptions: (streams) => {
    return streams
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith(`futures/depthIncrease`)) {
      const [levelStr, params] = stream.split('futures/depthIncrease')[1].split(':')
      const [symbol, speedMs] = params.split('@')
      const [speedStr] = speedMs.split('ms')

      const level = +levelStr as 5 | 20 | 50
      const speed = +speedStr as 100 | 200

      if (level !== 5 && level !== 20 && level !== 50) {
        throw `Invalid: ${stream}`
      }

      if (speed !== 100 && speed !== 200) {
        throw `Invalid: ${stream}`
      }

      return { subscription: 'orderbook', params: { symbol, speed, level } }
    }

    throw `invalid bitmart stream: ${stream}`
  }
})
