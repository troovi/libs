import classNames from 'classnames'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { varToStyle } from '@troovi/utils-browser'

export interface DrawerProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  children: React.ReactNode
  direction?: 'bottom' | 'top' | 'left' | 'right'
  className?: string
  /**
   * CSS size of the drawer. This sets `width` if horizontal position (default)
   * and `height` otherwise.
   *
   * Constants are available for common sizes:
   * - `DrawerSize.SMALL = 360px`
   * - `DrawerSize.STANDARD = 50%`
   * - `DrawerSize.LARGE = 90%`
   *
   * @default DrawerSize.STANDARD = "50%"
   */
  size?: string
}

export const Drawer = ({ open, onOpenChange, children, size, direction, className }: DrawerProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="drawer-overlay" />
        <DialogPrimitive.Content
          style={varToStyle({ '--drawer-size': size ?? '50%' })}
          className={classNames('drawer', className)}
          data-direction={direction}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title />
          </VisuallyHidden>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Drawer.Close = DialogPrimitive.Close
