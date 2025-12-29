import classNames from 'classnames'

import { forwardRef, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { InputContainer, InputContainerProps } from '../Input/InputContainer'
import { NumericFormat } from 'react-number-format'

export interface ReactNumberFormatParams {
  thousandSeparator?: boolean | string
  decimalSeparator?: string
  allowedDecimalSeparators?: Array<string>
  thousandsGroupStyle?: 'thousand' | 'lakh' | 'wan' | 'none'
  decimalScale?: number
  fixedDecimalScale?: boolean
  allowNegative?: boolean
  allowLeadingZeros?: boolean
  suffix?: string
  prefix?: string
}

export interface NumberInputProps
  extends Omit<InputContainerProps, 'inputRef' | 'children'>,
    ReactNumberFormatParams {
  placeholder?: string
  value?: number | null
  readOnly?: boolean
  onValueChange?: (value: number | null) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  inputRef?: React.Ref<HTMLInputElement>
  inputClassName?: string
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  (
    {
      onChange,
      onValueChange,
      readOnly,
      inputClassName,
      value,
      placeholder,
      thousandSeparator,
      decimalSeparator,
      allowedDecimalSeparators,
      thousandsGroupStyle,
      decimalScale,
      fixedDecimalScale,
      allowNegative = false,
      allowLeadingZeros,
      suffix,
      prefix,
      inputRef: clientInputRef,
      ...containerProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
      <InputContainer ref={ref} inputRef={inputRef} {...containerProps}>
        <NumericFormat
          type="text"
          getInputRef={mergeRefs([inputRef, clientInputRef])}
          className={classNames('form-input form-input-base', inputClassName)}
          aria-disabled={containerProps.disabled}
          onChange={onChange}
          onValueChange={({ floatValue }) => onValueChange?.(floatValue ?? null)}
          value={value}
          placeholder={placeholder}
          disabled={containerProps.disabled}
          readOnly={readOnly}
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
