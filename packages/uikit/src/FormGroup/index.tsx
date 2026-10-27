import cn from 'classnames'
import { attr } from '@companix/utils-browser'

export interface FormGroupProps {
  label: React.ReactNode
  /**
   * Содержимое у противоположного края строки подписи: подстановка значения, действие поля.
   */
  labelAside?: React.ReactNode
  children: React.ReactNode
  caption?: React.ReactNode
  appearance?: 'neutral' | 'positive' | 'negative'
  fill?: boolean
  className?: string
}

export const FormGroup = (props: FormGroupProps) => {
  const { fill, className, label, labelAside, children, caption, appearance = 'neutral' } = props

  return (
    <div className={cn('form-group', className)} data-fill={attr(fill)}>
      {labelAside ? (
        <div className="form-group-head">
          <div className="form-group-label">{label}</div>
          <div className="form-group-aside">{labelAside}</div>
        </div>
      ) : (
        <div className="form-group-label">{label}</div>
      )}
      {children}
      {caption && (
        <div className="form-group-caption" data-appearance={appearance}>
          {caption}
        </div>
      )}
    </div>
  )
}
