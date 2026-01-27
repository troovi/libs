import classNames from 'classnames'
import { Icon, IconDefinition, IconProps } from '../Icon'

export interface BlankProps {
  icon: IconDefinition
  iconSize?: IconProps['size']
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
  appearance?: 'neutral' | 'negative'
  style?: React.CSSProperties
}

const Blank = (props: BlankProps) => {
  const { appearance, icon, className, iconSize, title, description, children, style } = props

  return (
    <div
      className={classNames('blank', className)}
      data-appearance={appearance ?? 'neutral'}
      style={style}
    >
      <div className="blank-icon">
        <Icon icon={icon} size={iconSize} />
      </div>
      {(title || description) && (
        <div className="blank-text">
          {title && <h4 className="blank-title">{title}</h4>}
          {description && <div className="blank-description">{description}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export { Blank }
