import { Popover } from '../Popover'
import { Input, InputProps } from '../Input/Input'
import { useRef, useState } from 'react'
import { Calendar, CalendarProps } from '../Calendar/Calendar'
import { useDayDisableCheker } from '../__libs/calendar'
import { formatTime, getNum } from '@companix/utils-js'
import { removeDigits } from '../__utils/utils'
import { SelectRightElements } from '../Select/SelectRight'

const dateInput = {
  char: '-',
  toString: (value: Date | null): string => {
    if (value) {
      const day = formatTime(value.getDate())
      const month = formatTime(value.getMonth() + 1)
      const year = value.getFullYear()

      return [day, month, year].join(dateInput.char)
    }

    return ''
  },
  toValue: (input: string): Date | null => {
    const values = input.split(dateInput.char)

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
}

export interface DatePickerProps
  extends Omit<CalendarProps, 'onChange'>,
    Omit<InputProps, 'value' | 'onChange' | 'rightElement'> {
  onChange?: (value: Date | null) => void
  clearButton?: boolean
  clearButtonIcon?: boolean
  children?: React.ReactNode
}

export const DatePicker = (props: DatePickerProps) => {
  const {
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
    return dateInput.toString(value ?? null)
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

    const date = dateInput.toValue(value)

    if (date && !isDayDisabled(date)) {
      onChange?.(date)
    }
  }

  const handleInputBlur = () => {
    const date = dateInput.toValue(inputValue)

    if (!date || isDayDisabled(date)) {
      setInputValue(dateInput.toString(value ?? null))
    }
  }

  const handleCalendarChange = (value: Date) => {
    onChange?.(value)
    setInputValue(dateInput.toString(value))
  }

  return (
    <Popover
      minimal
      ref={popoverRef}
      sideOffset={0}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      disabled={disabled}
      fitMaxHeight={false}
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
      <Input
        {...inputProps}
        value={inputValue}
        disabled={disabled}
        onClick={handleRootClick}
        onValueChange={handleInputChange}
        onBlur={handleInputBlur}
        mask={'99-99-9999'}
        rightElement={
          <SelectRightElements
            clearButton={clearButton}
            clearButtonIcon={clearButtonIcon}
            value={Boolean(removeDigits(inputValue, ['-', '_']))}
            onClear={handleClear}
          />
        }
      />
    </Popover>
  )
}
