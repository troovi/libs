import './Button.scss'

import classNames from 'classnames'
import * as Headless from '@headlessui/react'
import { Spinner } from '../Spinner'
import { forwardRef } from 'react'
import { attr } from '@troovi/utils-browser'

interface ButtonProps extends Headless.ButtonProps {
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  accent?: 'primary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  isLoading?: boolean
  children?: React.ReactNode
  active?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, fill, icon, accent, isLoading, size, active, className, iconRight, ...buttonProps },
    ref
  ) => (
    <Headless.Button
      ref={ref}
      className={classNames('button', className)}
      data-size={size ?? 'md'}
      data-fill={attr(fill)}
      data-loading={attr(isLoading)}
      data-accent={accent ?? 'none'}
      data-highlighted={attr(active)}
      {...buttonProps}
      onClick={isLoading ? undefined : buttonProps.onClick}
    >
      {isLoading ? (
        <Spinner size={14} width={2} />
      ) : (
        <>
          {icon}
          {children && <span className="button-text">{children}</span>}
          {iconRight}
        </>
      )}
    </Headless.Button>
  )
)
