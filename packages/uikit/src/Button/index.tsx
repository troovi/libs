import classNames from 'classnames'
import { Spinner } from '../Spinner'
import { forwardRef } from 'react'
import { attr } from '@companix/utils-browser'

export type Appearance = 'primary' | 'neutral' | 'positive' | 'negative'
export type Mode = 'default' | 'outline' | 'minimal'
export type Size = 'sm' | 'md' | 'lg'

export interface InternButtonProps {
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  appearance?: Appearance
  mode?: Mode
  size?: Size
  fill?: boolean
  align?: 'left' | 'center' | 'right'
  loading?: boolean
  active?: boolean
  text?: React.ReactNode
  children?: React.ReactNode
  className?: string
  Component?: React.ElementType
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, InternButtonProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      fill,
      text,
      active,
      mode = 'default',
      appearance = 'neutral',
      size = 'md',
      align,
      icon,
      loading,
      className,
      iconRight,
      Component = 'button',
      ...buttonProps
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={classNames('button', className)}
        data-size={size}
        data-loading={attr(loading)}
        data-align={loading ? 'center' : align ?? (icon && iconRight ? 'left' : 'center')}
        data-appearance={appearance}
        data-mode={mode}
        data-fill={attr(fill)}
        data-active={attr(active)}
        type={Component === 'button' ? 'button' : undefined}
        {...buttonProps}
        onClick={loading ?? buttonProps.disabled ? undefined : buttonProps.onClick}
      >
        {loading ? (
          <Spinner size={14} />
        ) : (
          <>
            {icon}
            {(children ?? text) && <span className="button-text">{text ?? children}</span>}
            {iconRight}
          </>
        )}
      </Component>
    )
  }
)
