import { Popover } from '../Popover'
import { Input, InputProps } from '../Input/Input'
import { useEffect, useRef, useState } from 'react'
import { Calendar, CalendarProps } from '../Calendar/Calendar'
import { useDayDisableCheker } from '../__libs/calendar'
import { formatTime, getNum } from '@companix/utils-js'
import { hasMouse } from '@companix/utils-browser'
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

/** Значение нативного поля даты — `yyyy-mm-dd` по местному времени, без перевода в UTC. */
const nativeInput = {
  toString: (value: Date | null): string => {
    if (value) {
      const year = String(value.getFullYear()).padStart(4, '0')

      return [year, formatTime(value.getMonth() + 1), formatTime(value.getDate())].join('-')
    }

    return ''
  },
  toValue: (input: string): Date | null => {
    const [year, month, day] = input.split('-').map(Number)

    return year && month && day ? new Date(year, month - 1, day) : null
  }
}

export interface DatePickerProps
  extends Omit<CalendarProps, 'onChange'>,
    Omit<InputProps, 'value' | 'onChange' | 'rightElement' | 'inputType' | 'mask' | 'min' | 'max'> {
  onChange?: (value: Date | null) => void
  clearButton?: boolean
  clearButtonIcon?: boolean
  /**
   * Закрывать календарь после выбора дня.
   */
  closeOnChange?: boolean
  /**
   * Нативное поле даты устройства вместо поля с календарём: на телефоне — системный выбор даты. По умолчанию —
   * на устройствах без мыши, как у `DatePicker` VKUI 4–5: поле с всплывающим календарём VKUI на мобильных не
   * гарантирует. Ограничения дат нативное поле получает границами `min` и `max`, `shouldDisableDate` — проверкой
   * выбранного дня.
   */
  native?: boolean
  children?: React.ReactNode
}

export const DatePicker = ({ native = !hasMouse, ...props }: DatePickerProps) => {
  if (native) {
    return <NativeDatePicker {...props} />
  }

  return <CustomDatePicker {...props} />
}

type VariantProps = Omit<DatePickerProps, 'native'>

const CustomDatePicker = (props: VariantProps) => {
  const {
    clearButton,
    clearButtonIcon,
    children,
    disabled,
    closeOnChange = true,
    // calendar props
    value,
    disablePickers,
    showNeighboringMonth,
    onChange,
    shouldDisableDate,
    viewDate,
    onHeaderChange,
    onNextMonth,
    onPrevMonth,
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

  // значение, сменённое снаружи (сброс формы, загрузка), попадает в поле; ввод, ещё не ставший датой, не трогается
  const time = value?.getTime()

  useEffect(() => {
    setInputValue(dateInput.toString(value ?? null))
  }, [time])

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
      content={({ close }) => (
        <Calendar
          value={value}
          disablePast={disablePast}
          disableFuture={disableFuture}
          disablePickers={disablePickers}
          showNeighboringMonth={showNeighboringMonth}
          onChange={(value) => {
            handleCalendarChange(value)

            if (closeOnChange) {
              close()
            }
          }}
          shouldDisableDate={shouldDisableDate}
          viewDate={viewDate}
          onHeaderChange={onHeaderChange}
          onNextMonth={onNextMonth}
          onPrevMonth={onPrevMonth}
          minDateTime={minDateTime}
          maxDateTime={maxDateTime}
        />
      )}
    >
      <Input
        inputMode="numeric"
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
            disabled={disabled}
            value={Boolean(removeDigits(inputValue, ['-', '_']))}
            onClear={handleClear}
          />
        }
      />
    </Popover>
  )
}

/**
 * Нативное поле `type="date"` в оформлении `Input`: значение — та же `Date` по местному времени, что у поля с
 * календарём. Недоступный день (`shouldDisableDate` или границы) не принимается: поле возвращается к прежнему значению.
 */
const NativeDatePicker = (props: VariantProps) => {
  const {
    clearButton,
    clearButtonIcon,
    children,
    closeOnChange,
    // calendar props
    value,
    disablePickers,
    showNeighboringMonth,
    onChange,
    shouldDisableDate,
    viewDate,
    onHeaderChange,
    onNextMonth,
    onPrevMonth,
    disablePast,
    disableFuture,
    minDateTime,
    maxDateTime,
    // input props
    ...inputProps
  } = props

  const options = { disableFuture, disablePast, shouldDisableDate, minDateTime, maxDateTime }
  const isDayDisabled = useDayDisableCheker(options)
  const { min, max } = nativeBoundsOf(options)

  const handleInputChange = (input: string) => {
    const date = nativeInput.toValue(input)

    if (!date) {
      onChange?.(null)
      return
    }

    if (!isDayDisabled(date)) {
      onChange?.(date)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <Input
      {...inputProps}
      inputType="date"
      value={nativeInput.toString(value ?? null)}
      min={min ? nativeInput.toString(min) : undefined}
      max={max ? nativeInput.toString(max) : undefined}
      onValueChange={handleInputChange}
      rightElement={
        <SelectRightElements
          clearButton={clearButton}
          clearButtonIcon={clearButtonIcon}
          disabled={inputProps.disabled}
          value={Boolean(value)}
          onClear={handleClear}
        />
      }
    />
  )
}

/**
 * Границы нативного поля в том же порядке, что у проверки дня (`createDayDisableChecker`): `shouldDisableDate`
 * границ не даёт, затем `disableFuture`, `disablePast`, `minDateTime` и `maxDateTime`.
 */
const nativeBoundsOf = (options: Omit<CalendarProps, 'value' | 'onChange'>) => {
  const { shouldDisableDate, disableFuture, disablePast, minDateTime, maxDateTime } = options

  if (shouldDisableDate) {
    return { min: undefined, max: undefined }
  }

  if (disableFuture) {
    return { min: undefined, max: new Date() }
  }

  if (disablePast) {
    return { min: new Date(), max: undefined }
  }

  return { min: minDateTime, max: maxDateTime }
}
