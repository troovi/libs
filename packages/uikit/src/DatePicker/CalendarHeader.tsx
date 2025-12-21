import { useCallback, useMemo } from 'react'
import { Option, Select } from '..'
import { DEFAULT_MAX_YEAR, DEFAULT_MIN_YEAR, getMonths, getYears } from '@/__utils/utils'
import { Icon } from '@/Icon'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { setMonth, setYear } from '@/__libs/calendar'

export interface CalendarHeaderProps {
  /**
   * Отображаемая дата.
   */
  viewDate: Date
  /**
   * Отключает селекторы выбора месяца/года.
   */
  disablePickers?: boolean
  /**
   * Функция для проверки блокировки месяца.
   */
  isMonthDisabled?: (monthNumber: number, year?: number) => boolean
  /**
   * Функция для проверки блокировки года.
   */
  isYearDisabled?: (yearNumber: number) => boolean
  /**
   * Обработчик изменения отображаемой даты.
   */
  onChange: (viewDate: Date) => void
  /**
   * Нажатие на кнопку переключения на следующий месяц.
   */
  onNextMonth?: () => void
  /**
   * Нажатие на кнопку переключения на предыдущий месяц.
   */
  onPrevMonth?: () => void
}

export const CalendarHeader = ({
  viewDate,
  onChange,
  isMonthDisabled,
  isYearDisabled,
  onNextMonth,
  onPrevMonth
}: CalendarHeaderProps) => {
  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()
  const locale = 'ru'

  // handlers

  const onMonthsChange = useCallback(
    (newValue: number) => {
      onChange(setMonth(viewDate, newValue))
    },
    [onChange, viewDate]
  )

  const onYearChange = useCallback(
    (newValue: number) => {
      onChange(setYear(viewDate, newValue))
    },
    [onChange, viewDate]
  )

  // options

  const months = useMemo((): Option<number>[] => {
    return getMonths(locale).map((option) => ({
      ...option,
      className: 'capitalize',
      disabled: isMonthDisabled && isMonthDisabled(option.value)
    }))
  }, [locale, isMonthDisabled])

  const years = useMemo((): Option<number>[] => {
    return getYears(currentYear, 100).map((option) => ({
      ...option,
      disabled: isYearDisabled && isYearDisabled(option.value)
    }))
  }, [currentYear, isYearDisabled])

  // disable

  let nextMonthHidden = currentMonth === 11 && currentYear === DEFAULT_MAX_YEAR

  if (isMonthDisabled && !nextMonthHidden) {
    nextMonthHidden = isMonthDisabled(
      currentMonth === 11 ? 0 : currentMonth + 1,
      currentMonth === 11 ? Math.min(currentYear + 1, DEFAULT_MAX_YEAR) : currentYear
    )
  }

  let prevMonthHidden = currentMonth === 0 && currentYear === DEFAULT_MIN_YEAR

  if (isMonthDisabled && !prevMonthHidden) {
    prevMonthHidden = isMonthDisabled(
      currentMonth === 0 ? 11 : currentMonth - 1,
      currentMonth === 0 ? Math.max(currentYear - 1, DEFAULT_MIN_YEAR) : currentYear
    )
  }

  return (
    <div className="calendar-header">
      {!prevMonthHidden && (
        <button className="calendar-navigation" data-side="left" onClick={onPrevMonth}>
          <Icon icon={faChevronLeft} />
        </button>
      )}
      <div className="calendar-pickers">
        <Select
          fill
          options={years}
          size="sm"
          value={currentYear}
          minimalOptions
          matchTarget="min-width"
          onChange={(value) => onYearChange(value || 0)}
        />
        <Select
          fill
          options={months}
          size="sm"
          className="capitalize"
          value={currentMonth}
          minimalOptions
          matchTarget="min-width"
          onChange={(value) => onMonthsChange(value || 0)}
        />
      </div>
      {!nextMonthHidden && (
        <button className="calendar-navigation" data-side="right" onClick={onNextMonth}>
          <Icon icon={faChevronRight} />
        </button>
      )}
    </div>
  )
}
