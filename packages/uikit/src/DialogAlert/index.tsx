import { hash } from '@companix/utils-js'
import { useMemo, useRef } from 'react'
import { AlertDialogProps } from './Alert'
import { AlertBaseProps, Viewport, ViewportRef } from './Viewport'

export interface AlertOptions extends Omit<AlertDialogProps, 'open' | 'onOpenChange'> {}

export interface InnerAlert extends AlertOptions {
  id: string
}

export const createAlertAgent = (options: AlertBaseProps = {}) => {
  const store = {
    emit: (alert: InnerAlert) => {
      console.error('uninitialized', alert)
    }
  }

  return {
    show: (value: Omit<InnerAlert, 'id'>) => {
      store.emit({ ...value, id: hash() })
    },
    Viewport: () => {
      const ref = useRef<ViewportRef>(null)

      useMemo(() => {
        store.emit = (value) => {
          if (ref.current) {
            ref.current.showAlert(value)
          }
        }
      }, [])

      return <Viewport ref={ref} {...options} />
    }
  }
}
