import cn from 'classnames'

export interface SpinnerProps {
  size?: number
  className?: string
}

export const Spinner = ({ size = 40, className }: SpinnerProps) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn('spinner', className)}
      role="status"
    />
  )
}
