import cn from 'classnames'
import { PopupLayotProps, PopupLayout } from '../Popup'

export type DialogSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'full'

export interface DialogProps extends Omit<PopupLayotProps, 'content' | 'overlay'> {
  size?: DialogSize
  className?: string
  /** Появиться без анимации: окно уже на экране — эта оболочка сменяет другую, например ожидание. */
  instant?: boolean
}

export const Dialog = ({ size = 's', className, instant, children, ...props }: DialogProps) => {
  const instantAttr = instant ? '' : undefined

  return (
    <PopupLayout
      {...props}
      overlay={{ className: 'dialog-overlay', 'data-instant': instantAttr }}
      content={{ className: 'dialog-container', 'data-size': size, 'data-instant': instantAttr }}
    >
      <div className={cn('popup dialog', className)}>{children}</div>
    </PopupLayout>
  )
}

Dialog.Close = PopupLayout.Close
