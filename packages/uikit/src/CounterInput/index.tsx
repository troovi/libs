import classNames from 'classnames'

import { forwardRef, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { NumericFormat } from 'react-number-format'
import { faPlus, faMinus } from '@companix/icons-solid'
import { getFloatDigits, normalize } from '@companix/utils-js'
import { InputContainer, InputContainerProps } from '../Input/InputContainer'
import { Icon } from '../Icon'
import { ReactNumberFormatParams } from '../NumberInput'

export interface CounterInputProps
  extends Omit<InputContainerProps, 'inputRef' | 'children' | 'leftElement' | 'rightElement'>,
    ReactNumberFormatParams {
  placeholder?: string
  value?: number | null
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number | null) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  inputRef?: React.Ref<HTMLInputElement>
  inputClassName?: string
}

export const CounterInput = forwardRef<HTMLDivElement, CounterInputProps>(
  (
    {
      onChange,
      onValueChange,
      value,
      placeholder,
      min,
      max,
      step = 1,
      thousandSeparator,
      decimalSeparator,
      allowedDecimalSeparators,
      thousandsGroupStyle,
      decimalScale,
      fixedDecimalScale,
      allowNegative = (min ?? 0) < 0,
      allowLeadingZeros,
      suffix,
      prefix,
      inputClassName,
      inputRef: clientInputRef,
      disabled,
      onBlur,
      className,
      ...containerProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const precision = decimalScale ?? getFloatDigits(String(step))

    const clamp = (next: number) => {
      let result = next

      if (min !== undefined && result < min) result = min
      if (max !== undefined && result > max) result = max

      return normalize(result, precision)
    }

    const handleStep = (direction: 1 | -1) => {
      onValueChange?.(clamp(normalize((value ?? 0) + direction * step, precision)))
    }

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      if (value !== null && value !== undefined) {
        const clamped = clamp(value)

        if (clamped !== value) {
          onValueChange?.(clamped)
        }
      }

      onBlur?.(event)
    }

    const decreaseDisabled = disabled || (min !== undefined && value !== null && value !== undefined && value <= min)
    const increaseDisabled = disabled || (max !== undefined && value !== null && value !== undefined && value >= max)

    return (
      <InputContainer
        ref={ref}
        inputRef={inputRef}
        {...containerProps}
        disabled={disabled}
        onBlur={handleBlur}
        className={classNames('counter-input', className)}
        leftElement={
          <button
            type="button"
            className="counter-input-button"
            tabIndex={-1}
            disabled={decreaseDisabled}
            onClick={() => handleStep(-1)}
          >
            <Icon icon={faMinus} size="xxxs" />
          </button>
        }
        rightElement={
          <button
            type="button"
            className="counter-input-button"
            tabIndex={-1}
            disabled={increaseDisabled}
            onClick={() => handleStep(1)}
          >
            <Icon icon={faPlus} size="xxxs" />
          </button>
        }
      >
        <NumericFormat
          type="text"
          getInputRef={mergeRefs([inputRef, clientInputRef])}
          className={classNames('form-input form-input-base counter-input-field', inputClassName)}
          aria-disabled={disabled}
          onChange={onChange}
          onValueChange={({ floatValue }) => onValueChange?.(floatValue ?? null)}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          allowedDecimalSeparators={allowedDecimalSeparators}
          thousandsGroupStyle={thousandsGroupStyle}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={allowNegative}
          allowLeadingZeros={allowLeadingZeros}
          suffix={suffix}
          prefix={prefix}
        />
      </InputContainer>
    )
  }
)
