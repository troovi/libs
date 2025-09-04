import './Input.scss'
import * as Headless from '@headlessui/react'
import { attr } from '@troovi/utils-browser'
import { forwardRef } from 'react'

export interface InputProps extends Omit<Headless.InputProps, 'type' | 'className'> {
  error?: boolean
  disabled?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ error, disabled, ...props }, ref) => {
  return (
    <Headless.Input
      ref={ref}
      className="input"
      data-error={attr(error)}
      data-disabled={attr(disabled)}
      type="text"
      {...props}
    />
  )
})
