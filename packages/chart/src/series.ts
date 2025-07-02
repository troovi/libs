export type Interval = '1s' | '1m' | '3m' | '5m'

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  quoteVolume: number
}

export const intervals = {
  '1s': 1000,
  '1m': 1000 * 60,
  '3m': 1000 * 60 * 3,
  '5m': 1000 * 60 * 5
}

export const getLastClosedCandleTime = (timestamp: number, interval: Interval) => {
  return getCurrentCandleTime(timestamp, interval) - intervals[interval]
}

export const getCurrentCandleTime = (timestamp: number, interval: Interval) => {
  return Math.floor(timestamp / intervals[interval]) * intervals[interval]
}

export const getNextCandleTime = (timestamp: number, interval: Interval) => {
  return getCurrentCandleTime(timestamp, interval) + intervals[interval]
}

interface Options {
  interval: Interval
  endTime?: number
}

export const fillMissingCandles = (candles: Candle[], { interval, endTime }: Options): Candle[] => {
  if (candles.length === 0) return []

  if (endTime && candles[candles.length - 1].time < endTime) {
    const close = candles[candles.length - 1].close

    candles.push({
      time: endTime,
      open: close,
      high: close,
      low: close,
      close: close,
      volume: 0,
      quoteVolume: 0
    })
  }

  const result: Candle[] = []
  const intervalTime = intervals[interval]

  for (let i = 0; i < candles.length - 1; i++) {
    const current = candles[i]
    const next = candles[i + 1]

    result.push(current)

    const gap = (next.time - current.time) / intervalTime

    if (gap > 1) {
      for (let j = 1; j < gap; j++) {
        const missingTime = current.time + j * intervalTime

        result.push({
          time: missingTime,
          open: current.close,
          high: current.close,
          low: current.close,
          close: current.close,
          volume: 0,
          quoteVolume: 0
        })
      }
    }
  }

  // Добавляем последнюю свечу
  result.push(candles[candles.length - 1])

  return result
}

export interface CandleEvent {
  time: number
  volume: number
  price: number
}

export class CandleManager {
  candle: Candle

  constructor({ time, price, volume }: CandleEvent) {
    this.candle = {
      time,
      open: price,
      high: price,
      low: price,
      close: price,
      quoteVolume: price * volume,
      volume
    }
  }

  update({ volume, price }: Omit<CandleEvent, 'time'>) {
    this.candle.high = Math.max(this.candle.high, price)
    this.candle.low = Math.min(this.candle.low, price)
    this.candle.close = price
    this.candle.volume += volume
    this.candle.quoteVolume += price * volume
  }

  get() {
    return this.candle
  }
}
