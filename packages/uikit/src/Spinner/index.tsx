import cn from 'classnames'

interface Props {
  size?: number
  width?: number
  color?: string
  className?: string
}

export const Spinner = ({ size = 40, className, width = 4, color = 'inherit' }: Props) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px`, color, borderWidth: `${width}px` }}
      className={cn('spinner-border', className)}
      role="status"
    />
  )
}
