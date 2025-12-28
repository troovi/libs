import cn from 'classnames'

import { attr } from '@companix/utils-browser'
import { forwardRef } from 'react'
import { useInputPadding } from '../__hooks/use-input-padding'

export interface InputContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  disabled?: boolean
  required?: boolean
  inputRef: React.RefObject<HTMLInputElement>
  children: React.ReactNode
}

export const InputContainer = forwardRef<HTMLDivElement, InputContainerProps>(
  (
    {
      required,
      disabled,
      size,
      fill,
      leftElement,
      rightElement,
      className,
      inputRef,
      children,
      ...containerProps
    },
    ref
  ) => {
    const { leftRef, rightRef } = useInputPadding(inputRef, [leftElement, rightElement])

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
        {children}
        {rightElement && (
          <span ref={rightRef} className="form-input-base-right-element">
            {rightElement}
          </span>
        )}
      </div>
    )
  }
)
