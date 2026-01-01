import { forwardRef, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { InputElement } from './InputElement'
import { InputContainer, InputContainerProps } from './InputContainer'
import classNames from 'classnames'

export interface InputProps extends Omit<InputContainerProps, 'inputRef' | 'children'> {
  placeholder?: string
  value?: string
  readOnly?: boolean
  onValueChange?: (value: string, targetElement: HTMLInputElement) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  inputRef?: React.Ref<HTMLInputElement>
  inputClassName?: string
  mask?: string
  maskChar?: string
  type?: React.HTMLInputTypeAttribute
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      onChange,
      onValueChange,
      readOnly,
      inputClassName,
      value,
      placeholder,
      mask,
      type = 'text',
      maskChar,
      inputRef: clientInputRef,
      ...containerProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
      <InputContainer ref={ref} inputRef={inputRef} {...containerProps}>
        <InputElement
          type={type}
          ref={mergeRefs([inputRef, clientInputRef])}
          className={classNames('form-input form-input-base', inputClassName)}
          aria-disabled={containerProps.disabled}
          onChange={onChange}
          onValueChange={onValueChange}
          value={value}
          placeholder={placeholder}
          disabled={containerProps.disabled}
          readOnly={readOnly}
          maskChar={maskChar}
          mask={mask}
        />
      </InputContainer>
    )
  }
)
