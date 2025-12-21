import { Popover } from '..'
import { Form, FormProps } from '@/Form'
import { faChevronDown, faClose } from '@fortawesome/free-solid-svg-icons'
import { Icon } from '@/Icon'
import { useRef, useState } from 'react'
import { Calendar, CalendarProps } from './Calendar'
import { formatTime } from '@troovi/utils-js'
import { useDayDisableCheker } from '@/__libs/calendar'
import { getNum } from '@/__utils/utils'

interface DatePickerProps
  extends Omit<CalendarProps, 'onChange'>,
    Omit<FormProps, 'value' | 'onChange' | 'rightElement'> {
  onChange?: (value: Date | null) => void
  placeholder?: string
  clearButton?: boolean
  clearButtonIcon?: boolean
  children?: React.ReactNode
  minimalOptions?: boolean
}

const createInputValue = (value: Date | null, char: string = '-'): string => {
  if (value) {
    const day = formatTime(value.getDate())
    const month = formatTime(value.getMonth() + 1)
    const year = value.getFullYear()

    return [day, month, year].join(char)
  }

  return ''
}

const inputToDate = (input: string, char: string = '-'): Date | null => {
  const values = input.split(char)

  if (values.length === 3) {
    const [day, month, year] = [getNum(values[0]), getNum(values[1]), getNum(values[2])]

    if (day && month && year) {
      const date = new Date(year, month - 1, day)

      if (date.getFullYear() === year && date.getDate() === day && date.getMonth() === month - 1) {
        return date
      }
    }
  }

  return null
}

export const DatePicker = (props: DatePickerProps) => {
  const {
    minimalOptions,
    clearButton,
    clearButtonIcon,
    children,
    disabled,
    // calendar props
    value,

    enableTime,
    disablePickers,
    showNeighboringMonth,
    onChange,
    shouldDisableDate,
    viewDate,
    disablePast,
    disableFuture,
    minDateTime,
    maxDateTime,
    // input props
    ...inputProps
  } = props

  const [inputValue, setInputValue] = useState(() => {
    return createInputValue(value ?? null)
  })

  const popoverRef = useRef<HTMLDivElement>(null)

  const isDayDisabled = useDayDisableCheker({
    disableFuture,
    disablePast,
    shouldDisableDate,
    minDateTime,
    maxDateTime
  })

  const handleRootClick = (event: React.MouseEvent) => {
    if (disabled) return

    // Предотвращаем закрытие Popover при клике на форму
    if (popoverRef.current && popoverRef.current.getAttribute('data-state') === 'open') {
      event.preventDefault()
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()

    setInputValue('')
    onChange?.(null)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)

    const date = inputToDate(value)

    if (date && !isDayDisabled(date)) {
      onChange?.(date)
    }
  }

  const handleInputBlur = () => {
    const date = inputToDate(inputValue)

    if (!date || isDayDisabled(date)) {
      setInputValue(createInputValue(value ?? null))
    }
  }

  const handleCalendarChange = (value: Date) => {
    onChange?.(value)
    setInputValue(createInputValue(value))
  }

  return (
    <Popover
      minimal
      ref={popoverRef}
      sideOffset={0}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      disabled={disabled}
      content={() => (
        <Calendar
          value={value}
          disablePast={disablePast}
          disableFuture={disableFuture}
          enableTime={enableTime}
          disablePickers={disablePickers}
          showNeighboringMonth={showNeighboringMonth}
          onChange={handleCalendarChange}
          shouldDisableDate={shouldDisableDate}
          viewDate={viewDate}
          minDateTime={minDateTime}
          maxDateTime={maxDateTime}
        />
      )}
    >
      <Form
        {...inputProps}
        value={inputValue}
        disabled={disabled}
        onClick={handleRootClick}
        onValueChange={handleInputChange}
        onBlur={handleInputBlur}
        mask={'99-99-9999'}
        rightElement={
          <>
            {clearButton && isInputDefined(inputValue) && (
              <button className="select-close-button" onClick={handleClear}>
                {clearButtonIcon ?? <Icon className="select-close-icon" icon={faClose} size="xxxs" />}
              </button>
            )}
            <Icon className="expand-icon select-expand" icon={faChevronDown} size="xxxs" />
          </>
        }
      />
    </Popover>
  )
}

const isInputDefined = (value: string) => {
  return value.trim().replaceAll('-', '').replaceAll('_', '')
}
