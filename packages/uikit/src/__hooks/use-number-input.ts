import { useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react'
import { normalize, truncateNumber, getFloatDigits } from '@troovi/utils-js'

export interface NumberInputOptions {
  value: number
  onChange: (value: number) => void
  step?: number
  minValue?: number
}

export const useNumberInput = ({ minValue, value, onChange, step = 1 }: NumberInputOptions) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const precision = useMemo(() => {
    return getFloatDigits(step.toString())
  }, [step])

  const formatting = useCallback(
    (value: number) => {
      if (minValue && value < minValue) {
        return minValue.toFixed(precision)
      }

      return truncateNumber(value, precision)
    },
    [minValue, precision]
  )

  const [inputValue, setInputValue] = useState({
    value: formatting(value),
    cursor: 0
  })

  const setChanges = (value: number, i: number = 0) => {
    const nextValue = formatting(value)

    setInputValue({ value: nextValue, cursor: (inputRef.current?.selectionStart || 0) + i })
    onChange(+nextValue)
  }

  if (+inputValue.value !== value) {
    setInputValue({ value: formatting(value), cursor: 0 })
  }

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(inputValue.cursor, inputValue.cursor)
      inputRef.current.focus()
    }
  }, [inputValue])

  return {
    inputRef,
    value: inputValue.value,
    increment: () => {
      setChanges(normalize(value + step, precision))
    },
    decrement: () => {
      setChanges(normalize(value - step, precision))
    },
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value.trim()

      if (value) {
        if (isNaN(+value) || value.includes('e')) {
          setChanges(+inputValue.value, -1)
          return
        }

        if (inputValue.value.includes('.') && inputValue.value.replace('.', '') === value) {
          if (inputRef.current && inputRef.current.selectionStart) {
            setChanges(+inputValue.value)
            return
          }
        }
      }

      setChanges(+value)
    }
  }
}
