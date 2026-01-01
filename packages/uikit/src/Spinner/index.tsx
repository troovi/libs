import cn from 'classnames'

export interface SpinnerProps {
  size?: number
  width?: number
  color?: string
  className?: string
}

export const Spinner = ({ size = 40, className, width = 2, color = 'inherit' }: SpinnerProps) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px`, color, borderWidth: `${width}px` }}
      className={cn('spinner-border', className)}
      role="status"
    />
  )
}
