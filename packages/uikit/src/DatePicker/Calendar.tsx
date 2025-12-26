import {
  createVoids,
  dateToFormat,
  getDayIndex,
  getFirstDay,
  getMonthMaxDay,
  weeks
} from '../__utils/utils'
import { CalendarHeader } from './CalendarHeader'
import { useCalendar } from '../__hooks/useCalendar'
import { attr } from '@troovi/utils-browser'
import { isSameDate } from '../__libs/calendar'
import { useLayoutEffect } from 'react'

export interface CalendarProps {
  /**
   * Текущая выбранная дата.
   */
  value?: Date | null
  /**
   * Запрещает выбор даты в прошлом.
   * Применяется, если не заданы `shouldDisableDate` и `disableFuture`.
   */
  disablePast?: boolean
  /**
   * Запрещает выбор даты в будущем.
   * Применяется, если не задано `shouldDisableDate`.
   */
  disableFuture?: boolean
  /**
   * Включает выбор времени.
   */
  enableTime?: boolean
  /**
   * Отключает селекторы выбора месяца/года.
   */
  disablePickers?: boolean
  /**
   * Показывать дни соседних месяцев.
   */
  showNeighboringMonth?: boolean
  /**
   * Обработчик изменения выбранной даты.
   */
  onChange?: (value: Date) => void
  /**
   * Функция для проверки запрета выбора даты.
   */
  shouldDisableDate?: (value: Date) => boolean
  /**
   * Дата отображаемого месяца.
   * При использовании обновление даты должно происходить вне компонента.
   */
  viewDate?: Date
  /**
   * Минимальные дата и время, которые можно выбрать.
   * Применяется, если не заданы `shouldDisableDate` и `disablePast`/`disableFuture`.
   */
  minDateTime?: Date
  /**
   * Максимальные дата и время, которые можно выбрать.
   * Применяется, если не заданы `shouldDisableDate` и `disablePast`/`disableFuture`.
   */
  maxDateTime?: Date
}

export const Calendar = ({ disablePickers, value, onChange, ...props }: CalendarProps) => {
  const {
    viewDate,
    setViewDate,
    setNextMonth,
    setPrevMonth,
    isMonthDisabled,
    isYearDisabled,
    isDayDisabled
  } = useCalendar(props)

  useLayoutEffect(() => {
    if (value) {
      setViewDate(value)
    }
  }, [value])

  const date = dateToFormat(viewDate)

  const monthIndex = viewDate.getMonth()
  const year = viewDate.getFullYear()
  const now = new Date()

  return (
    <div className="calendar">
      <CalendarHeader
        viewDate={viewDate}
        onChange={setViewDate}
        onNextMonth={setNextMonth}
        onPrevMonth={setPrevMonth}
        disablePickers={disablePickers}
        isMonthDisabled={isMonthDisabled}
        isYearDisabled={isYearDisabled}
      />
      <div className="calendar-names">
        {weeks.map((name, i) => (
          <div className="calendar-name" key={`week-name-${i}`}>
            {name}
          </div>
        ))}
      </div>
      <div className="calendar-days">
        {createVoids(getDayIndex(getFirstDay(date.month, date.year))).map((n, i) => (
          <div className="calendar-day" data-void key={`void-${n}-${i}`} />
        ))}
        {createVoids(getMonthMaxDay(date.month, date.year)).map((n, i) => {
          const date = new Date(year, monthIndex, i + 1)

          return (
            <CalendarDay
              day={i + 1}
              key={`date-${n}-${year}-${monthIndex}-${i}`}
              disabled={isDayDisabled(date)}
              selected={Boolean(value && isSameDate(value, date))}
              today={isSameDate(date, now)}
              onSelect={() => onChange?.(date)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface CalendarDayProps {
  day: number
  disabled?: boolean
  selected?: boolean
  today?: boolean
  onSelect?: () => void
}

const CalendarDay = ({ day, disabled, selected, today, onSelect }: CalendarDayProps) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect?.()
    }
  }

  return (
    <div
      className="calendar-day"
      data-disabled={attr(disabled)}
      data-selected={attr(selected)}
      data-today={attr(today)}
      onClick={handleClick}
    >
      <span className="calendar-day-number">{day}</span>
    </div>
  )
}
