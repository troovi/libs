import { getDayIndex, weeks } from '../__utils/utils'
import { CalendarHeader } from './CalendarHeader'
import { useCalendar } from '../__hooks/useCalendar'
import { attr } from '@companix/utils-browser'
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
   * Отключает селекторы выбора месяца/года: в шапке — месяц и год текстом.
   */
  disablePickers?: boolean
  /**
   * Показывать дни соседних месяцев: они дополняют первую и последнюю недели и выбираются, как дни месяца.
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
   * При использовании обновление даты должно происходить вне компонента — по `onHeaderChange`, `onNextMonth` и
   * `onPrevMonth`.
   */
  viewDate?: Date
  /**
   * Смена отображаемого месяца: селекторы месяца и года в шапке или выбор даты.
   */
  onHeaderChange?: (viewDate: Date) => void
  /**
   * Нажатие на кнопку переключения на следующий месяц.
   */
  onNextMonth?: () => void
  /**
   * Нажатие на кнопку переключения на предыдущий месяц.
   */
  onPrevMonth?: () => void
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

/**
 * Выбор и отображение даты происходит по местному часовому поясу.
 * Получившаяся метка времени будет иметь смещение относительно UTC.
 * Например, при выборе даты 12.07.2003 00:00 в часовом поясе Asia/Shanghai (UTC+8),
 * будет сформирована метка времени 2003-07-11T16:00:00.000Z, так как локальное время приводится к UTC путём вычитания смещения местного часового пояса (+8 часов).
 * Это означает, что метка времени с датой 12.07.2003 00:00 выбранной в Asia/Shanghai (2003-07-11T16:00:00.000Z), будет отображена компонентом как 11.07.2003 19:00 в часовом поясе Europe/Moscow.
 */
export const Calendar = (props: CalendarProps) => {
  const {
    disablePickers,
    showNeighboringMonth,
    value,
    onChange,
    viewDate: externalViewDate,
    ...options
  } = props

  const {
    viewDate: internalViewDate,
    setViewDate,
    setNextMonth,
    setPrevMonth,
    isMonthDisabled,
    isYearDisabled,
    isDayDisabled
  } = useCalendar({ value, ...options })

  // зависимость — метка времени, а не объект: значение, которое родитель создаёт заново при каждой отрисовке, не
  // возвращает календарь к своему месяцу после листания
  const time = value?.getTime()

  useLayoutEffect(() => {
    if (value) {
      setViewDate(value)
    }
  }, [time])

  const viewDate = externalViewDate ?? internalViewDate
  const days = getGridDays(viewDate, showNeighboringMonth)
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
        {days.map((day, i) => {
          if (!day) {
            return <div className="calendar-day" data-void key={`void-${i}`} />
          }

          return (
            <CalendarDay
              day={day.date.getDate()}
              key={day.date.getTime()}
              outside={day.isOutside}
              disabled={isDayDisabled(day.date)}
              selected={Boolean(value && isSameDate(value, day.date))}
              today={isSameDate(day.date, now)}
              onSelect={() => onChange?.(day.date)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface GridDay {
  date: Date
  /** День соседнего месяца. */
  isOutside: boolean
}

/**
 * Ячейки сетки месяца по неделям с понедельника. Дни соседних месяцев дополняют первую и последнюю недели с
 * `showNeighboringMonth`, без него перед первым днём — пустые ячейки (`null`).
 */
const getGridDays = (viewDate: Date, showNeighboringMonth?: boolean): (GridDay | null)[] => {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const leading = getDayIndex(new Date(year, month, 1).getDay())
  const count = new Date(year, month + 1, 0).getDate()
  const trailing = showNeighboringMonth ? (7 - ((leading + count) % 7)) % 7 : 0

  return Array.from({ length: leading + count + trailing }, (_, index) => {
    const date = new Date(year, month, index - leading + 1)
    const isOutside = date.getMonth() !== month

    return isOutside && !showNeighboringMonth ? null : { date, isOutside }
  })
}

interface CalendarDayProps {
  day: number
  outside?: boolean
  disabled?: boolean
  selected?: boolean
  today?: boolean
  onSelect?: () => void
}

const CalendarDay = ({ day, outside, disabled, selected, today, onSelect }: CalendarDayProps) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect?.()
    }
  }

  return (
    <div
      className="calendar-day"
      data-outside={attr(outside)}
      data-disabled={attr(disabled)}
      data-selected={attr(selected)}
      data-today={attr(today)}
      onClick={handleClick}
    >
      <span className="calendar-day-number">{day}</span>
    </div>
  )
}
