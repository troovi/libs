import cn from 'classnames'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export interface DialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  children: React.ReactNode
  size?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'full'
  className?: string
}

export const Dialog = ({ size = 's', open, onOpenChange, children, className }: DialogProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="popup-overlay dialog-overlay" />
        <DialogPrimitive.Content className="popup-container dialog-container" data-size={size}>
          <div className={cn('popup dialog', className)}>
            <VisuallyHidden>
              <DialogPrimitive.Title />
            </VisuallyHidden>
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Dialog.Close = DialogPrimitive.Close
