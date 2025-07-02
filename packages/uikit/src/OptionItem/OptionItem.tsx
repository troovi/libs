import './index.scss'
import { attr } from '@troovi/utils-browser'
import { forwardRef } from 'react'

interface OptionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon?: JSX.Element
  label?: string
  active?: boolean
  onClick?: () => void
}

export const OptionItem = forwardRef<HTMLDivElement, OptionProps>(
  ({ title, icon, active, ...rest }, ref) => {
    return (
      <div ref={ref} className="option-item" {...rest} data-active={attr(active)}>
        {icon}
        <span className="option-item-text">{title}</span>
      </div>
    )
  }
)
