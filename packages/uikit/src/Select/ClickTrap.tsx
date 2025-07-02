import * as Headless from '@headlessui/react'
import { forwardRef } from 'react'

export const ClickTrap = forwardRef<HTMLButtonElement, any>((props, ref) => {
  return (
    <Headless.Button
      {...props}
      onPointerDown={undefined}
      onClick={(e) => props.onPointerDown(e)}
      ref={ref}
    />
  )
})
