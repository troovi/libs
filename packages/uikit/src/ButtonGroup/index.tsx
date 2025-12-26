import { forwardRef } from 'react'
import cn from 'classnames'
import { attr } from '@companix/utils-browser'

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  fill?: boolean
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, fill }, ref) => {
    return (
      <div ref={ref} className={cn('button-group', className)} data-fill={attr(fill)}>
        {children}
      </div>
    )
  }
)
