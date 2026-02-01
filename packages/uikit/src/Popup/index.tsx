import cn from 'classnames'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { RemoveListener } from '../__utils/RemoveListener'

export interface PopupLayotProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  children: React.ReactNode
  defaultOpen?: boolean
  disableEsc?: boolean
  onClosed?: () => void
  overlay?: React.HTMLAttributes<HTMLDivElement>
  content?: React.HTMLAttributes<HTMLDivElement> & {
    [data: `data-${string}`]: string | undefined
  }
}

export const PopupLayout = (props: PopupLayotProps) => {
  const { open, onOpenChange, children, onClosed, disableEsc, overlay = {}, content = {} } = props

  const handleEscape = (e: KeyboardEvent) => {
    if (disableEsc) {
      e.preventDefault()
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay {...overlay} className={cn('popup-overlay', overlay.className)} />
        <DialogPrimitive.Content {...content} onEscapeKeyDown={handleEscape}>
          <RemoveListener callback={onClosed} />
          <VisuallyHidden>
            <DialogPrimitive.Title />
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogPrimitive.Description />
          </VisuallyHidden>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

PopupLayout.Close = DialogPrimitive.Close
