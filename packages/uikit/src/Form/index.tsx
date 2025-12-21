import cn from 'classnames'
import InputMask from 'react-input-mask'

import { useLayoutAndUpdate } from '@/__hooks/use-update'
import { attr } from '@troovi/utils-browser'
import { forwardRef, useCallback, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'

export interface FormProps extends React.HTMLAttributes<HTMLDivElement> {
  required?: boolean
  disabled?: boolean
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  placeholder?: string
  value?: string | number
  readOnly?: boolean
  onValueChange?: (value: string, targetElement: HTMLInputElement) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  inputRef?: React.RefObject<HTMLInputElement>
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  mask?: string
  maskChar?: string
}

export const Form = forwardRef<HTMLDivElement, FormProps>(
  (
    {
      required,
      size,
      fill,
      leftElement,
      rightElement,
      onChange,
      onValueChange,
      readOnly,
      className,
      value,
      placeholder,
      disabled,
      mask,
      maskChar,
      inputRef: clientInputRef,
      ...containerProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const rightRef = useRef<HTMLSpanElement>(null)
    const leftRef = useRef<HTMLSpanElement>(null)

    const elements = { Right: rightRef, Left: leftRef }

    const updateInputWidth = useCallback((side: 'Left' | 'Right') => {
      if (inputRef.current) {
        const input = inputRef.current.style
        const element = elements[side]

        if (element.current && element.current.clientWidth) {
          if (input[`padding${side}`] !== `${element.current.clientWidth}px`) {
            input[`padding${side}`] = `${element.current.clientWidth}px`
          }
        } else {
          if (input[`padding${side}`]) {
            input[`padding${side}`] = ''
          }
        }
      }
    }, [])

    useLayoutAndUpdate(() => {
      updateInputWidth('Left')
      updateInputWidth('Right')
    }, [rightElement, leftElement])

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
      onValueChange?.(event.target.value, event.target)
    }, [])

    return (
      <div
        ref={ref}
        className={cn('form', className)}
        data-size={size ?? 'md'}
        data-fill={attr(fill)}
        data-required={attr(required)}
        data-disabled={attr(disabled)}
        {...containerProps}
      >
        {leftElement && (
          <span ref={leftRef} className="form-input-base-left-element">
            {leftElement}
          </span>
        )}
        <Input
          type="text"
          ref={mergeRefs([inputRef, clientInputRef])}
          className="form-input form-input-base"
          aria-disabled={disabled}
          onChange={handleInputChange}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maskChar={maskChar}
          mask={mask}
        />
        {rightElement && (
          <span ref={rightRef} className="form-input-base-right-element">
            {rightElement}
          </span>
        )}
      </div>
    )
  }
)

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  mask?: string
  maskChar?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ mask, maskChar, ...inputProps }, ref) => {
  if (mask) {
    return <InputMask inputRef={ref} mask={mask} maskChar={maskChar} {...inputProps} />
  }

  return <input ref={ref} {...inputProps} />
})
