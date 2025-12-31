import cn from 'classnames'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { RemoveListener } from '../__utils/RemoveListener'

export type DialogSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'full'

export interface DialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  defaultOpen?: boolean
  children: React.ReactNode
  size?: DialogSize
  className?: string
  disableEsc?: boolean
  onClosed?: () => void
}

export const Dialog = (props: DialogProps) => {
  const { size = 's', open, onOpenChange, children, onClosed, disableEsc, className } = props

  const handleEscape = (e: KeyboardEvent) => {
    if (disableEsc) e.preventDefault()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="popup-overlay dialog-overlay" />
        <DialogPrimitive.Content
          className="popup-container dialog-container"
          data-size={size}
          onEscapeKeyDown={handleEscape}
        >
          <div className={cn('popup dialog', className)}>
            <RemoveListener callback={onClosed} />
            <VisuallyHidden>
              <DialogPrimitive.Title />
            </VisuallyHidden>
            <VisuallyHidden>
              <DialogPrimitive.Description />
            </VisuallyHidden>
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Dialog.Close = DialogPrimitive.Close
