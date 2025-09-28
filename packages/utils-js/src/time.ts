export type Interval = '1s' | '1m' | '3m' | '5m'

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
