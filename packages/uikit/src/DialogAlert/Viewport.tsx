import { forwardRef, useImperativeHandle, useState } from 'react'
import { InnerAlert } from '.'
import { AlertDialog, AlertDialogProps } from './Alert'

export interface ViewportRef {
  showAlert: (alert: InnerAlert) => void
}

export interface AlertBaseProps extends Pick<AlertDialogProps, 'cancelDefaultText'> {}

export const Viewport = forwardRef<ViewportRef, AlertBaseProps>((props, ref) => {
  const [alerts, setAlerts] = useState<InnerAlert[]>([])

  useImperativeHandle(
    ref,
    () => {
      return {
        showAlert: (alert) => {
          setAlerts((state) => [...state, alert])
        }
      }
    },
    []
  )

  const handleClose = (id: string) => {
    setAlerts((state) => {
      const nextState = [...state]
      const index = nextState.findIndex((item) => item.id === id)

      if (index !== -1) {
        nextState.splice(index, 1)
      }

      return nextState
    })
  }

  return (
    <>
      {alerts.map(({ id, ...alert }) => (
        <AlertDialog
          defaultOpen
          onUnMounted={() => handleClose(id)}
          key={`alert-${id}`}
          {...props}
          {...alert}
        />
      ))}
    </>
  )
})
