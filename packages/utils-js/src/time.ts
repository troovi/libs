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

export const formatTime = (value: number) => {
  return value.toString().padStart(2, '0')
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

export const getTime = (timestamp: number) => {
  const date = new Date(timestamp)

  const times = [
    formatTime(date.getUTCHours()),
    formatTime(date.getUTCMinutes()),
    formatTime(date.getUTCSeconds())
  ]

  return times.join(':')
}

export const getDate = (timestamp: number) => {
  const date = new Date(timestamp)

  const times = [
    formatTime(date.getUTCDate()),
    formatTime(date.getUTCMonth() + 1),
    formatTime(date.getUTCFullYear())
  ]

  return times.join(':')
}

export const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  const milliseconds = ms % 1000

  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours} h.`)
  }

  if (minutes > 0) {
    parts.push(`${minutes} m.`)
  }

  if (parts.length !== 2 && seconds > 0) {
    parts.push(`${seconds} s.`)
  }

  if (parts.length === 0) {
    parts.push(`${milliseconds} ms`)
  }

  return parts.join(' ')
}
