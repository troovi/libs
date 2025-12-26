import { DefaultMonths, getMonthMaxDay } from '../__utils/utils'
import { useMemo } from 'react'
import { DateFormat } from '..'
import { range } from '@troovi/utils-js'

export const defaultMax = { day: 31, month: 12, year: 2050 }
export const defaultMin = { day: 1, month: 1, year: 1900 }

interface Options {
  min?: DateFormat
  max?: DateFormat
  now: DateFormat
}

export const useCalendarOptions = ({ min = defaultMin, max = defaultMax, now }: Options) => {
  const years = useMemo(() => {
    return range(max.year, min.year).map((value) => ({
      title: value.toString(),
      value
    }))
  }, [max.year, min.year])

  const months = useMemo(() => {
    const options = DefaultMonths.map((name, index) => ({
      title: name,
      value: index + 1
    }))

    if (min.month && now.year === min.year) {
      const i = options.findIndex(({ value }) => value === min.month)
      options.splice(0, i)
    }

    if (max.month && now.year === max.year) {
      const i = options.findIndex(({ value }) => value === max.month)
      options.splice(i + 1, options.length)
    }

    return options
  }, [now.year, min.year, min.month, max.year, max.month])

  const days = useMemo(() => {
    if (now.month === 0) {
      return []
    }

    const maxDays = getMonthMaxDay(now.month, now.year)

    const options = Array.from({ length: maxDays }, (_, i) => ({
      title: `${i + 1}`,
      value: i + 1
    }))

    if (min.day && now.month === min.month && now.year === min.year) {
      const i = options.findIndex(({ value }) => value === min.day)
      options.splice(0, i)
    }

    if (max.day && now.month === max.month && now.year === max.year) {
      const i = options.findIndex(({ value }) => value === max.day)
      options.splice(i + 1, options.length)
    }

    return options
  }, [now.month, now.year, min, max])

  return { years, months, days }
}
