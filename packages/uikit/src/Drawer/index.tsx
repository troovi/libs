import cn from 'classnames'
import { customCSS } from '@companix/utils-browser'
import { PopupLayotProps, PopupLayout } from '../Popup'

export interface DrawerProps extends Omit<PopupLayotProps, 'content' | 'overlay'> {
  direction?: 'bottom' | 'top' | 'left' | 'right'
  className?: string
  size?: string
}

export const Drawer = ({ direction, children, size, className, ...props }: DrawerProps) => {
  return (
    <PopupLayout
      {...props}
      overlay={{ className: 'drawer-overlay' }}
      content={{
        className: cn('popup drawer', className),
        style: customCSS({ '--drawer-size': size ?? '50%' }),
        'data-direction': direction
      }}
    >
      {children}
    </PopupLayout>
  )
}

Drawer.Close = PopupLayout.Close
