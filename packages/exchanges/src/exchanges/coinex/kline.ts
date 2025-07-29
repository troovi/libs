import { CoinExStream } from './ws/stream'
import { CoinExMessages } from './ws/messages'
import { Candle, getCurrentCandleTime } from '@troovi/chart'

interface Params {
  stream: CoinExStream
}

interface Event {
  symbol: string
  market: 'spot' | 'futures'
  event: Candle
}

interface Subscribe {
  symbol: string
  market: 'spot' | 'futures'
  interval: '1m' | '5m'
}

export class CoinExKline {
  private stream: CoinExStream
  private store = {
    spot: {} as {
      [symbol: string]: {
        interval: '1m' | '5m'
        data: null | Candle
      }
    },
    futures: {} as {
      [symbol: string]: {
        interval: '1m' | '5m'
        data: null | Candle
      }
    }
  }

  private onEvent: (data: Event) => void

  constructor({ stream }: Params, onEvent: (data: Event) => void) {
    this.onEvent = onEvent
    this.stream = stream
  }

  update(market: 'spot' | 'futures', { data }: CoinExMessages.State) {
    data.state_list.forEach((item) => {
      const source = this.store[market][item.market]

      if (!source) return

      const time = getCurrentCandleTime(Date.now(), source.interval)

      if (!source.data || time > source.data.time) {
        source.data = this.createCandle(time, +item.close)
      } else {
        this.updateCandle(source.data, +item.close)
      }

      return this.onEvent({
        market,
        symbol: item.market,
        event: source.data
      })
    })
  }

  private createCandle(time: number, price: number): Candle {
    return {
      time,
      open: price,
      high: price,
      low: price,
      close: price,
      quoteVolume: 0,
      volume: 0
    }
  }

  private updateCandle(candle: Candle, price: number) {
    candle.high = Math.max(candle.high, price)
    candle.low = Math.min(candle.low, price)
    candle.close = price
  }

  async subscribe({ symbol, market, interval }: Subscribe) {
    this.store[market][symbol] = { interval, data: null }

    await this.stream.subscribe('state', (createStream) => {
      return createStream({ symbol })
    })
  }

  async unsubscribe({ symbol, market }: Subscribe) {
    delete this.store[market][symbol]

    await this.stream.unsubscribe('state', (createStream) => {
      return createStream({ symbol })
    })
  }
}
