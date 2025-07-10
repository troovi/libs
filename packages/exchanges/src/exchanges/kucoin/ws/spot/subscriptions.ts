import { Subscriptions } from '../../../../subscriptions'

export const subscriptions = new Subscriptions({
  subscriptions: {
    orderbook: (symbols: string[]) => {
      return `/market/level2:${symbols.join(',')}`
    },
    orderbook50: (symbols: string[]) => {
      return `/spotMarket/level2Depth50:${symbols.join(',')}`
    }
  },
  getStreams: (topic: string) => {
    return subscriptionsParser.getStreams(topic)
  }
})

export const subscriptionsParser = {
  getStreams: (topic: string) => {
    if (topic.startsWith('/spotMarket/level2Depth50')) {
      const symbols = topic.split(':')[1].split(',')

      return symbols.map((symbol) => {
        return `/spotMarket/level2Depth50:${symbol}`
      })
    }

    if (topic.startsWith('/market/level2')) {
      const symbols = topic.split(':')[1].split(',')

      return symbols.map((symbol) => {
        return `/market/level2:${symbol}`
      })
    }

    return [topic]
  },
  getTopic: (streams: string[]) => {
    if (streams.length === 1) {
      return streams[0]
    }

    const topic = streams[0].split(':')[0]
    const symbols = streams.map((stream) => {
      return stream.split(':')[1]
    })

    return `${topic}:${symbols.join(',')}`
  }
}
