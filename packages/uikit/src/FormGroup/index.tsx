import cn from 'classnames'
import { attr } from '@companix/utils-browser'

export interface FormGroupProps {
  label: React.ReactNode
  children: React.ReactNode
  caption?: React.ReactNode
  apperance?: 'neutral' | 'positive' | 'negative'
  fill?: boolean
  className?: string
}

export const FormGroup = (props: FormGroupProps) => {
  const { fill, className, label, children, caption, apperance = 'neutral' } = props

  return (
    <div className={cn('form-group', className)} data-fill={attr(fill)}>
      <div className="form-group-label">{label}</div>
      {children}
      {caption && (
        <div className="form-group-caption" data-appearance={apperance}>
          {caption}
        </div>
      )}
    </div>
  )
}
