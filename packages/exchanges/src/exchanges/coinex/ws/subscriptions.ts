import { StreamsManager } from '../../../stream-manager'

export const streams = new StreamsManager({
  combinable: true,
  streams: {
    orderbook: (opts: { symbol: string; level: 5 | 10 | 20 | 50; isFull?: boolean }) => {
      return `depth:${JSON.stringify([opts.symbol, opts.level, '0', opts.isFull ?? false])}`
    },
    state: (data: { symbol: string }) => {
      return `state:${data.symbol}`
    }
  },
  getSubscriptions: (streams) => {
    const method = streams[0].split(':')[0]

    if (method === 'depth') {
      const markets = streams.map((stream) => {
        return JSON.parse(stream.split(':')[1]) as [string, number, string, boolean]
      })

      return { method, markets }
    }

    if (method === 'state') {
      const markets = streams.map((stream) => stream.split(':')[1])

      return { method, markets }
    }

    throw 'coinex subscription faild'
  },
  getStreamInfo: (stream) => {
    if (stream.startsWith('depth:')) {
      const params = JSON.parse(stream.split(':')[1]) as [string, number, string, boolean]

      const symbol = params[0]
      const level = params[1] as 5 | 10 | 20 | 50
      const isFull = params[3]

      return { subscription: 'orderbook', params: { symbol, level, isFull } }
    }

    if (stream.startsWith('state:')) {
      return { subscription: 'state', params: { symbol: stream.split(':')[1] } }
    }

    throw `invalid coinex stream: ${stream}`
  }
})
