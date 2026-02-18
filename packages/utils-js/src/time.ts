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

export const getTimestamp = (date: DateFormat, time: TimeFormat, timezone?: string) => {
  const { year, month, day } = date
  const { hours, minutes } = time

  if (!timezone) {
    return new Date(year, month - 1, day, hours, minutes, 0, 0).getTime()
  }

  // Use the input values as a neutral UTC base to probe the target timezone's offset.
  // Формат дат и их перевод задаётся с помощью средств браузера [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
  const approxUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0)

  // Returns how far the target timezone's wall clock is ahead of UTC at a given UTC timestamp.
  // e.g. UTC+5 → +5h, UTC-3 → -3h (in milliseconds)
  const getTimezoneOffsetMs = (ms: number): number => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    })

    const values = {} as Record<Intl.DateTimeFormatPartTypes, string>

    for (const { type, value } of formatter.formatToParts(new Date(ms))) {
      values[type] = value
    }

    // Reinterpret what the timezone clock shows as if it were UTC, then diff
    const tzMs = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour) % 24, // hour12: false can yield 24 for midnight
      Number(values.minute),
      Number(values.second)
    )

    return tzMs - ms
  }

  // To get the UTC timestamp for a wall-clock time in `timezone`:
  //   UTC = wallClock - offset(UTC)
  // Since offset depends on the timestamp itself (DST), we do two passes:
  //   pass 1 → approx UTC using offset at the neutral base
  //   pass 2 → refine using offset at the approx UTC (resolves DST boundary edge cases)
  return approxUtcMs - getTimezoneOffsetMs(approxUtcMs - getTimezoneOffsetMs(approxUtcMs))
}
