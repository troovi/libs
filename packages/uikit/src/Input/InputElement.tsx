import { forwardRef, useCallback } from 'react'
import ReactInputMask from 'react-input-mask'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  mask?: string
  maskChar?: string
  onValueChange?: (value: string, targetElement: HTMLInputElement) => void
}

export const InputElement = forwardRef<HTMLInputElement, InputProps>(
  ({ mask, maskChar, onChange, onValueChange, ...inputProps }, ref) => {
    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event)
        onValueChange?.(event.target.value, event.target)
      },
      [onChange, onValueChange]
    )

    if (mask) {
      return (
        <ReactInputMask
          inputRef={ref}
          mask={mask}
          maskChar={maskChar}
          onChange={handleInputChange}
          {...inputProps}
        />
      )
    }

    return <input ref={ref} {...inputProps} onChange={handleInputChange} />
  }
)
