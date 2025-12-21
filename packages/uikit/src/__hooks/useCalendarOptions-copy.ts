import { DefaultMonths, getMonthMaxDay, range } from '@/__utils/utils'
import { useMemo } from 'react'

export const defaultMax = new Date(2050, 0, 1)
export const defaultMin = new Date(1925, 0, 1)

interface Options {
  min?: Date
  max?: Date
  now: Date
}

const getDate = (date: Date) => {
  return {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear()
  }
}

export const useCalendarOptions2 = ({ min = defaultMin, max = defaultMax, now }: Options) => {
  const max_values = useMemo(() => getDate(max), [max])
  const min_values = useMemo(() => getDate(min), [min])
  const now_values = useMemo(() => getDate(now), [now])

  const years = useMemo(() => {
    return range(max_values.year, min_values.year).map((value) => ({
      title: value.toString(),
      value
    }))
  }, [max_values.year, min_values.year])

  const months = useMemo(() => {
    const options = DefaultMonths.map((name, index) => ({
      title: name,
      value: index
    }))

    if (min_values.month && now_values.year === min_values.year) {
      const i = options.findIndex(({ value }) => value === min_values.month)
      options.splice(0, i)
    }

    if (max_values.month && now_values.year === max_values.year) {
      const i = options.findIndex(({ value }) => value === max_values.month)
      options.splice(i + 1, options.length)
    }

    return options
  }, [now_values.year, min_values.year, min_values.month, max_values.year, max_values.month])

  const days = useMemo(() => {
    if (now_values.month === 0) {
      return []
    }

    const maxDays = getMonthMaxDay(now_values.month, now_values.year)

    const options = Array.from({ length: maxDays }, (_, i) => ({
      title: `${i + 1}`,
      value: i + 1
    }))

    if (
      min_values.day &&
      now_values.month === min_values.month &&
      now_values.year === min_values.year
    ) {
      const i = options.findIndex(({ value }) => value === min_values.day)
      options.splice(0, i)
    }

    if (
      max_values.day &&
      now_values.month === max_values.month &&
      now_values.year === max_values.year
    ) {
      const i = options.findIndex(({ value }) => value === max_values.day)
      options.splice(i + 1, options.length)
    }

    return options
  }, [now_values.month, now_values.year, min, max])

  return { years, months, days }
}
