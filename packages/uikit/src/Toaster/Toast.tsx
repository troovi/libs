import * as ToasterPrimitive from '@radix-ui/react-toast'
import { attr } from '@companix/utils-browser'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ToastOptions } from '.'
import { RemoveListener } from '../__utils/RemoveListener'

interface ToastProps extends ToastOptions {
  id: string
  onClosed: () => void
  onClosing: () => void
  onInitialized: (ref: HTMLLIElement) => void
}

export const Toast = (options: ToastProps) => {
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  const ref = useRef<HTMLLIElement>(null)

  const {
    appearance = 'neutral',
    icon,
    title,
    description,
    duration,
    closeIcon,
    onClosing,
    onClosed,
    closable = true,
    onInitialized
  } = options

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (ref.current) {
      onInitialized(ref.current)
    }
  }, [])

  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClosing()
    }

    setOpen(open)
  }

  return (
    <ToasterPrimitive.Root
      ref={ref}
      data-expanded
      data-appearance={appearance}
      data-mounted={attr(mounted)}
      className="toaster"
      open={open}
      onOpenChange={onOpenChange}
      duration={duration}
    >
      <RemoveListener callback={onClosed} />
      {icon && <div className="toaster-icon">{icon}</div>}
      <div className="toaster-content">
        {title && <ToasterPrimitive.Title className="toaster-title">{title}</ToasterPrimitive.Title>}
        {description && (
          <ToasterPrimitive.Description className="toaster-description">
            {description}
          </ToasterPrimitive.Description>
        )}
      </div>
      {closable && (
        <Toast.Close className="toaster-close toaster-close-placement" closeIcon={closeIcon} />
      )}
    </ToasterPrimitive.Root>
  )
}

Toast.Close = ({ closeIcon, className }: { closeIcon?: React.ReactNode; className?: string } = {}) => {
  return (
    <ToasterPrimitive.Close className={className}>
      {closeIcon ?? (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.96967 2.96967C3.26256 2.67678 3.73744 2.67678 4.03033 2.96967L8 6.939L11.9697 2.96967C12.2626 2.67678 12.7374 2.67678 13.0303 2.96967C13.3232 3.26256 13.3232 3.73744 13.0303 4.03033L9.061 8L13.0303 11.9697C13.2966 12.2359 13.3208 12.6526 13.1029 12.9462L13.0303 13.0303C12.7374 13.3232 12.2626 13.3232 11.9697 13.0303L8 9.061L4.03033 13.0303C3.73744 13.3232 3.26256 13.3232 2.96967 13.0303C2.67678 12.7374 2.67678 12.2626 2.96967 11.9697L6.939 8L2.96967 4.03033C2.7034 3.76406 2.6792 3.3474 2.89705 3.05379L2.96967 2.96967Z" />
        </svg>
      )}
    </ToasterPrimitive.Close>
  )
}
