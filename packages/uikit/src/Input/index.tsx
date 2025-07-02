import './Input.scss'
import * as Headless from '@headlessui/react'
import { forwardRef } from 'react'

interface InputProps extends Omit<Headless.InputProps, 'type' | 'className'> {}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <Headless.Input ref={ref} className="input" type="text" {...props} />
})
