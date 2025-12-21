import { hash } from '@troovi/utils-js'
import { Viewport, ViewportProps, ViewportRef } from './Viewport'
import { useMemo, useRef } from 'react'

export interface ToastOptions {
  appearance?: 'primary' | 'neutral' | 'positive' | 'negative' | 'warning'
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
}

export interface InnerToast extends ToastOptions {
  id: string
}

export const createToaster = (rootProps: ViewportProps = {}) => {
  const store = {
    emit: (toast: InnerToast) => {
      console.error('uninitialized', toast)
    }
  }

  return {
    send: (toast: ToastOptions) => {
      store.emit({ ...toast, id: hash() })
    },
    Viewport: (props: ViewportProps = {}) => {
      const ref = useRef<ViewportRef>(null)

      useMemo(() => {
        store.emit = (value) => {
          if (ref.current) {
            ref.current.addToast(value)
          }
        }
      }, [])

      return (
        <Viewport
          ref={ref}
          align={props.align ?? rootProps.align}
          closeIcon={props.closeIcon ?? rootProps.closeIcon}
          duration={props.duration ?? rootProps.duration}
          gap={props.gap ?? rootProps.gap}
          side={props.side ?? rootProps.side}
          swipeThreshold={props.swipeThreshold ?? rootProps.swipeThreshold}
        />
      )
    }
  }
}
