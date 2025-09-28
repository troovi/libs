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

export const getTimes = (ms: number) => {
  if (ms < 0) {
    ms = 0
  }

  const totalSeconds = Math.floor(ms / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds }
}
