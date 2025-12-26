import { CalendarProps } from '../DatePicker/Calendar'
import { useCallback, useMemo } from 'react'

export function isSameDate(d1: Date, d2: Date): boolean {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

export const MONDAY = 1

/**
 * Возвращает дату начала недели
 */
export function startOfWeek(date: Date, { weekStartsOn = MONDAY }): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn

  result.setDate(result.getDate() - diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Возвращает дату конца недели
 */
export function endOfWeek(date: Date, { weekStartsOn = MONDAY }): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn)

  result.setDate(result.getDate() + diff)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Возвращает дату начала дня
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Возвращает дату конца дня
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Позволяет определить удовлетворяет ли исходная дата заданным ограничения `min` и/или `max`
 */
export function isDayMinMaxRestricted(
  day: Date,
  options: { min?: Date; max?: Date; withTime?: boolean } = {}
): boolean {
  const { min, max, withTime = false } = options

  if (!withTime && ((min && isSameDate(day, min)) || (max && isSameDate(day, max)))) {
    return false
  }

  return Boolean((min && day < min) || (max && day > max))
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date)

  if (!amount) {
    return result
  }

  const dayOfMonth = result.getDate()

  const endOfDesiredMonth = new Date(date)
  endOfDesiredMonth.setMonth(result.getMonth() + amount + 1, 0) // Конец месяца
  const daysInMonth = endOfDesiredMonth.getDate()
  if (dayOfMonth >= daysInMonth) {
    // Если мы уже находимся в конце месяца, то это нужная дата
    return endOfDesiredMonth
  }

  result.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth)
  return result
}

export function subMonths(date: Date, amount: number): Date {
  return addMonths(date, -amount)
}

// set

function getDaysInMonth(date: Date): number {
  const result = new Date(date)
  const lastDayOfMonth = new Date(result)
  lastDayOfMonth.setFullYear(result.getFullYear(), result.getMonth() + 1, 0)
  lastDayOfMonth.setHours(0, 0, 0, 0)
  return lastDayOfMonth.getDate()
}

export function setYear(date: Date, year: number): Date {
  const result = new Date(date)
  result.setFullYear(year)
  return result
}

export function setMonth(date: Date, month: number): Date {
  const result = new Date(date)
  const year = result.getFullYear()
  const day = result.getDate()

  const midMonth = new Date(date)
  midMonth.setFullYear(year, month, 15)
  midMonth.setHours(0, 0, 0, 0)
  const daysInMonth = getDaysInMonth(midMonth)

  result.setMonth(month, Math.min(day, daysInMonth))
  return result
}

// custom

interface DisableOptions
  extends Pick<
    CalendarProps,
    'disableFuture' | 'disablePast' | 'maxDateTime' | 'minDateTime' | 'shouldDisableDate'
  > {}

export const createDayDisableChecker = (options: DisableOptions) => {
  const { disableFuture, disablePast, maxDateTime, minDateTime, shouldDisableDate } = options

  return (day: Date, withTime?: boolean) => {
    const now = new Date()

    if (shouldDisableDate) {
      return shouldDisableDate(day)
    }

    if (disableFuture) {
      return startOfDay(day) > now
    }

    if (disablePast) {
      return endOfDay(day) < now
    }

    if (minDateTime || maxDateTime) {
      return isDayMinMaxRestricted(day, { min: minDateTime, max: maxDateTime, withTime })
    }

    return false
  }
}

export const useDayDisableCheker = (options: DisableOptions) => {
  const isDayDisabled = useMemo(() => {
    return createDayDisableChecker(options)
  }, [
    options.disableFuture,
    options.disablePast,
    options.shouldDisableDate,
    options.minDateTime,
    options.maxDateTime
  ])

  return useCallback(isDayDisabled, [isDayDisabled])
}
