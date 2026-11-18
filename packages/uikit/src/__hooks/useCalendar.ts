import { CalendarProps } from '../Calendar/Calendar'
import { addMonths, subMonths, useDayDisableCheker } from '../__libs/calendar'
import { DEFAULT_MAX_YEAR, DEFAULT_MIN_YEAR } from '../__utils/utils'
import { useCallback, useState } from 'react'

export interface UseCalendarDependencies
  extends Pick<
    CalendarProps,
    | 'minDateTime'
    | 'maxDateTime'
    | 'shouldDisableDate'
    | 'disableFuture'
    | 'disablePast'
    | 'onHeaderChange'
    | 'onNextMonth'
    | 'onPrevMonth'
  > {
  value?: Date | null
}

export const useCalendar = ({
  value,
  disablePast,
  disableFuture,
  shouldDisableDate,
  minDateTime,
  maxDateTime,
  onHeaderChange,
  onNextMonth,
  onPrevMonth
}: UseCalendarDependencies) => {
  const [viewDate, setViewDate] = useState(value || new Date())

  const setPrevMonth = useCallback(() => {
    onPrevMonth?.()
    setViewDate(subMonths(viewDate, 1))
  }, [viewDate, onPrevMonth])

  const setNextMonth = useCallback(() => {
    onNextMonth?.()
    setViewDate(addMonths(viewDate, 1))
  }, [viewDate, onNextMonth])

  const handleSetViewDate = useCallback(
    (value: Date) => {
      onHeaderChange?.(value)
      setViewDate(value)
    },
    [onHeaderChange]
  )

  const isDayDisabled = useDayDisableCheker({
    disableFuture,
    disablePast,
    shouldDisableDate,
    minDateTime,
    maxDateTime
  })

  const isMonthDisabled = useCallback(
    (month: number, year?: number): boolean => {
      const now = new Date()
      year = year || viewDate.getFullYear()
      const minMonth = minDateTime ? minDateTime.getMonth() : 0
      const maxMonth = maxDateTime ? maxDateTime.getMonth() : 11
      const minYear = minDateTime?.getFullYear() || DEFAULT_MIN_YEAR
      const maxYear = maxDateTime?.getFullYear() || DEFAULT_MAX_YEAR

      let isDisabled =
        year >= minYear && year <= maxYear
          ? (year === minYear && minMonth > month) || (year === maxYear && month > maxMonth)
          : true

      if (disableFuture) {
        isDisabled =
          isDisabled || (year === now.getFullYear() ? month > now.getMonth() : year > now.getFullYear())
      }

      if (disablePast) {
        isDisabled =
          isDisabled || (year === now.getFullYear() ? month < now.getMonth() : year < now.getFullYear())
      }

      return isDisabled
    },
    [disableFuture, disablePast, viewDate, minDateTime, maxDateTime]
  )

  const isYearDisabled = useCallback(
    (year: number): boolean => {
      const now = new Date()
      const minYear = minDateTime?.getFullYear() || DEFAULT_MIN_YEAR
      const maxYear = maxDateTime?.getFullYear() || DEFAULT_MAX_YEAR

      let isDisabled = minYear > year || year > maxYear

      if (disableFuture) {
        isDisabled = isDisabled || year > now.getFullYear()
      }

      if (disablePast) {
        isDisabled = isDisabled || year < now.getFullYear()
      }

      return isDisabled
    },
    [disableFuture, disablePast, minDateTime, maxDateTime]
  )

  return {
    viewDate,
    setViewDate: handleSetViewDate,
    setPrevMonth,
    setNextMonth,
    isDayDisabled,
    isMonthDisabled,
    isYearDisabled
  }
}
