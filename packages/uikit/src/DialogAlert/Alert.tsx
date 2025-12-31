import * as AlertPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from '..'
import { InternButtonProps } from '../Button'
import { RemoveListener } from '../__utils/RemoveListener'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ActionProps extends Omit<InternButtonProps, 'children'> {
  onClick?: () => void
}

export interface AlertDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (value: boolean) => void
  onUnMounted?: () => void
  icon?: React.ReactNode
  title?: string
  description?: string
  confirm?: ActionProps
  cancel?: ActionProps
  cancelDefaultText?: string
  disableCancel?: boolean
}

export const AlertDialog = ({
  open,
  defaultOpen,
  onOpenChange,
  onUnMounted,
  icon,
  title,
  description,
  cancelDefaultText,
  cancel,
  disableCancel,
  confirm
}: AlertDialogProps) => {
  return (
    <AlertPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RemoveListener callback={onUnMounted} />
      <AlertPrimitive.Portal>
        <AlertPrimitive.Overlay className="popup-overlay dialog-overlay" />
        <AlertPrimitive.Content className="popup-container dialog-container">
          <div className="popup alert">
            <div className="alert-body">
              {icon && <span className="alert-icon">{icon}</span>}
              <div className="alert-content">
                {title && <AlertPrimitive.Title className="alert-title">{title}</AlertPrimitive.Title>}
                {!title && (
                  <VisuallyHidden>
                    <AlertPrimitive.Title />
                  </VisuallyHidden>
                )}
                {description && (
                  <AlertPrimitive.Description className="alert-description">
                    {description}
                  </AlertPrimitive.Description>
                )}
              </div>
            </div>
            <div className="alert-footer">
              {!disableCancel && (cancel?.text || cancelDefaultText) && (
                <AlertPrimitive.Cancel asChild>
                  <Button appearance="neutral" {...cancel} text={cancel?.text ?? cancelDefaultText} />
                </AlertPrimitive.Cancel>
              )}
              {confirm?.text && (
                <AlertPrimitive.Action asChild>
                  <Button appearance="negative" {...confirm} />
                </AlertPrimitive.Action>
              )}
            </div>
          </div>
        </AlertPrimitive.Content>
      </AlertPrimitive.Portal>
    </AlertPrimitive.Root>
  )
}
