import { DateFormat, dateFormat } from './primitives/date'
import { TimeFormat } from './primitives/time'

export const ONE_MINUTE = 60 * 1000
export const ONE_HOUR = 60 * ONE_MINUTE
export const ONE_DAY = 24 * ONE_HOUR
export const ONE_WEEK = 7 * ONE_DAY
export const ONE_MONTH = 30 * ONE_DAY

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

interface Options {
  utc?: boolean
}

export const getTime = (timestamp: number, { utc }: Options = {}) => {
  const date = new Date(timestamp)
  const prefix = utc ? 'UTC' : ''

  const values = [formatTime(date[`get${prefix}Hours`]()), formatTime(date[`get${prefix}Minutes`]())]

  return values.join(':')
}

export const getDate = (timestamp: number, { utc }: Options = {}) => {
  const date = new Date(timestamp)
  const prefix = utc ? 'UTC' : ''

  const values = [
    formatTime(date[`get${prefix}Date`]()),
    formatTime(date[`get${prefix}Month`]() + 1),
    formatTime(date[`get${prefix}FullYear`]())
  ]

  return values.join('.')
}

export const getDateTime = (timestamp: number, options: Options = {}) => {
  return [getDate(timestamp, options), getTime(timestamp, options)].join(' ')
}

export const getDateFromFormat = (date: DateFormat) => {
  return getDate(dateFormat.getDate(date).getTime())
}

export const getTimeFromFormat = ({ hours, minutes }: TimeFormat) => {
  return [formatTime(hours), formatTime(minutes)].join(':')
}

export const getDuration = (sec: number) => {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = Math.floor(sec % 60)

  if (hours > 0) {
    return `${hours}:${formatTime(minutes)}:${formatTime(seconds)}`
  }

  return `${minutes}:${formatTime(seconds)}`
}

export const getTimestamp = ({ year, month, day }: DateFormat, { hours, minutes }: TimeFormat) => {
  const date = new Date()

  date.setFullYear(year, month - 1, day)
  date.setHours(hours, minutes, 0, 0)

  return date.getTime()
}
