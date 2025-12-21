import { useMemo, useEffect } from 'react'
import { DateFormat, Select } from '..'
import { createDateValidation, getMonthMaxDay } from '@/__utils/utils'
import { defaultMax, defaultMin, useCalendarOptions } from '@/__hooks/useCalendarOptions'

export interface DatePickerProps {
  min?: DateFormat
  max?: DateFormat
  noDaySelect?: boolean
  noYearSelect?: boolean
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  value: DateFormat
  onChange: (e: DateFormat) => void
}

export const DateInput = ({
  min = defaultMin,
  max = defaultMax,
  disabled,
  value,
  noDaySelect,
  noYearSelect,
  onChange,
  required,
  size
}: DatePickerProps) => {
  const validateDate = useMemo(() => {
    return createDateValidation({ min, max })
  }, [min, max])

  useEffect(() => {
    const changed = validateDate(value)

    if (changed) {
      onChange(changed)
    }
  }, [validateDate, value])

  const { years, months, days } = useCalendarOptions({ min, max, now: value })

  const handleDateChange = (source: 'year' | 'month' | 'day', val: number) => {
    const nextValue = { ...value }

    nextValue[source] = val

    const max = getMonthMaxDay(nextValue.month, nextValue.year)
    nextValue.day = nextValue.day > max ? max : nextValue.day

    onChange(nextValue)
  }

  return (
    <div className="data-input">
      {!noYearSelect && years.length > 0 && (
        <Select
          placeholder="Год"
          options={years}
          onChange={(e) => handleDateChange('year', e || 0)}
          value={value.year}
          required={required}
          disabled={disabled}
          size={size}
          minimalOptions
          matchTarget="min-width"
        />
      )}
      <Select
        placeholder="Месяц"
        className="w-full"
        options={months}
        onChange={(e) => handleDateChange('month', e || 0)}
        value={value.month}
        disabled={disabled}
        required={required}
        size={size}
        minimalOptions
        matchTarget="min-width"
      />
      {!noDaySelect && (
        <Select
          placeholder="День"
          options={days}
          disabled={disabled || days.length === 0}
          onChange={(e) => handleDateChange('day', e || 0)}
          value={value.day}
          required={required}
          size={size}
          minimalOptions
          matchTarget="min-width"
        />
      )}
    </div>
  )
}
