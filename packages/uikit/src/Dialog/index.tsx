import cn from 'classnames'
import { PopupLayotProps, PopupLayout } from '../Popup'

export type DialogSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'full'

export interface DialogProps extends Omit<PopupLayotProps, 'content' | 'overlay'> {
  size?: DialogSize
  className?: string
}

export const Dialog = ({ size = 's', className, children, ...props }: DialogProps) => {
  return (
    <PopupLayout
      {...props}
      overlay={{ className: 'dialog-overlay' }}
      content={{ className: 'dialog-container', 'data-size': size }}
    >
      <div className={cn('popup dialog', className)}>{children}</div>
    </PopupLayout>
  )
}

Dialog.Close = PopupLayout.Close
