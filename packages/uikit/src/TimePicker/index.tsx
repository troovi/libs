import { useEffect, useMemo, useRef, useState } from 'react'
import { getNum } from '@companix/utils-js'
import { removeDigits, convertTimeToOption, getTimeValue, getTimesOptions } from '../__utils/utils'
import { SelectRightElements } from '../Select/SelectRight'
import { InputProps } from '../Input/Input'
import { TimeFormat } from '..'
import { Select } from '../Select'
import { Input } from '../Input/Input'

const timeInput = {
  char: ':',
  toString: (value: TimeFormat | null): string => {
    return value ? convertTimeToOption(value, timeInput.char) : ''
  },
  toValue: (input: string): TimeFormat | null => {
    const values = input.split(timeInput.char)

    if (values.length === 2) {
      const [hours, minutes] = [getNum(values[0]), getNum(values[1])]

      if (hours !== null && minutes !== null) {
        if (hours < 24 && hours >= 0 && minutes < 60 && minutes >= 0) {
          return { hours, minutes }
        }
      }
    }

    return null
  }
}

export interface TimePickerProps extends Omit<InputProps, 'value' | 'onChange' | 'rightElement'> {
  required?: boolean
  value: TimeFormat | null
  onChange: (value: TimeFormat | null) => void
  clearButton?: boolean
  clearButtonIcon?: boolean
}

export const TimePicker = (props: TimePickerProps) => {
  const { value, onChange, clearButton, clearButtonIcon, disabled, ...inputProps } = props

  const popoverRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<{ scrollTo: (index: number) => void }>(null)

  const baseOptions = useMemo(() => {
    return getTimesOptions(10)
  }, [])

  const options = useMemo(() => {
    if (value && !value.minutes.toString().endsWith('0')) {
      const index = value.hours * 6 + Math.trunc(value.minutes / 10)
      const nextOptions = [...baseOptions]

      // add specific selected time
      nextOptions.splice(index + 1, 0, getTimeValue(value))

      return nextOptions
    }

    return baseOptions
  }, [baseOptions, value])

  const [inputValue, setInputValue] = useState(() => {
    return timeInput.toString(value)
  })

  const handleInputChange = (value: string) => {
    setInputValue(value)

    const time = timeInput.toValue(value)

    if (time) {
      onChange?.(time)
    }
  }

  const handleRootClick = (event: React.MouseEvent) => {
    if (disabled) return

    // Предотвращаем закрытие Popover при клике на форму
    if (popoverRef.current && popoverRef.current.getAttribute('data-state') === 'open') {
      event.preventDefault()
    }
  }

  const handleInputBlur = () => {
    const time = timeInput.toValue(inputValue)

    if (time === null) {
      setInputValue(timeInput.toString(value ?? null))
    }
  }

  const handleChange = (value: string) => {
    onChange?.(timeInput.toValue(value))
    setInputValue(value)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()

    setInputValue('')
    onChange?.(null)
  }

  useEffect(() => {
    if (inputValue && inputValue !== '__:__') {
      const [hours, minutes] = inputValue.split(':')

      const getNumber = (input: string) => {
        const [start, end] = input.split('')
        const [startNumber, endNumber] = [start === '_' ? '0' : start, end === '_' ? '0' : end]

        return startNumber + endNumber
      }

      const pattern = [getNumber(hours), getNumber(minutes)].join(':')
      const patternValue = timeInput.toValue(pattern)

      if (patternValue) {
        const index = patternValue.hours * 6 + Math.trunc(patternValue.minutes / 10)

        if (index !== -1 && scrollRef.current) {
          scrollRef.current.scrollTo(index)
        }
      }
    }
  }, [options, inputValue])

  return (
    <Select
      minimalOptions
      options={options}
      onChange={handleChange}
      value={inputValue}
      popoverRef={popoverRef}
      scrollRef={scrollRef}
      disabled={disabled}
    >
      <Input
        {...inputProps}
        value={inputValue}
        disabled={disabled}
        onClick={handleRootClick}
        onValueChange={handleInputChange}
        onBlur={handleInputBlur}
        mask={'99:99'}
        placeholder="00:00"
        rightElement={
          <SelectRightElements
            clearButton={clearButton}
            clearButtonIcon={clearButtonIcon}
            value={Boolean(removeDigits(inputValue, [':', '_']))}
            onClear={handleClear}
          />
        }
      />
    </Select>
  )
}
