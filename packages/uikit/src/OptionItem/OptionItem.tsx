import cn from 'classnames'

import { Icon } from '../Icon'
import { attr } from '@companix/utils-browser'
import { forwardRef } from 'react'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { Option } from '../types'

interface OptionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    Omit<Option<unknown>, 'value'> {
  active?: boolean
  minimal?: boolean
}

export const OptionItem = forwardRef<HTMLDivElement, OptionProps>(
  ({ title, icon, active, label, disabled, minimal, onClick, className, ...rest }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onClick?.(event)
      }
    }

    return (
      <div
        ref={ref}
        {...rest}
        className={cn('option', className)}
        data-selected={attr(active)}
        data-disabled={attr(disabled)}
        data-minimal={attr(minimal)}
        onClick={handleClick}
      >
        <div className="option-content">
          {icon && <div className="option-icon">{icon}</div>}
          <div className="option-content-layout">
            <div className="option-title">{title}</div>
            {label && <div className="option-label">{label}</div>}
          </div>
        </div>
        {active && !minimal && (
          <div className="option-check">
            <Icon icon={faCheck} />
          </div>
        )}
      </div>
    )
  }
)
