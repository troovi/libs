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
  /** Управление модальностью Radix Dialog (фокус-трап/блокировка скролла/aria-hidden окружения).
   *  Для встроенных (contained) попапов передавайте `false`, чтобы остальной UI оставался живым. */
  modal?: boolean
  /** DOM-узел для портала Radix. По умолчанию портал идёт в `document.body`; передайте элемент,
   *  чтобы открыть попап/drawer внутри конкретного контейнера (например рабочей области). */
  container?: HTMLElement | null
  overlay?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
  overlayRef?: React.Ref<HTMLDivElement>
  content?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    [data: `data-${string}`]: string | undefined
  }
  contentRef?: React.Ref<HTMLDivElement>
}

export const PopupLayout = (props: PopupLayotProps) => {
  const { open, onOpenChange, children, onClosed, disableEsc, modal, container, overlay = {}, overlayRef, content = {}, contentRef } = props

  const handleEscape = (e: KeyboardEvent) => {
    if (disableEsc) {
      e.preventDefault()
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay {...overlay} ref={overlayRef} className={cn('popup-overlay', overlay.className)} />
        <DialogPrimitive.Content {...content} ref={contentRef} onEscapeKeyDown={handleEscape}>
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
