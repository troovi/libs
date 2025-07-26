import { StreamsManager } from '../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: (opts: { symbol: string; level: 5 | 10 | 20 | 50; isFull?: boolean }) => {
      return `depth:${JSON.stringify([opts.symbol, opts.level, '0', opts.isFull ?? false])}`
    }
  },
  getSubscriptions: (streams) => {
    const method = streams[0].split(':')[0]
    const subscriptions = streams.map((stream) => {
      return JSON.parse(stream.split(':')[1]) as object[]
    })

    return { method, subscriptions }
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('depth:')) {
      const params = JSON.parse(stream.split(':')[1]) as {
        symbol: string
        level: 5 | 10 | 20 | 50
        isFull: boolean
      }

      return { subscription: 'orderbook', params }
    }

    throw `invalid coinex stream: ${stream}`
  }
})
