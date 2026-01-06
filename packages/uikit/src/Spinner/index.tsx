import cn from 'classnames'

export interface SpinnerProps {
  size?: number
  className?: string
  color?: string
}

export const Spinner = ({ size = 18, className, color }: SpinnerProps) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px`, color }}
      className={cn('spinner', className)}
      role="status"
    />
  )
}
