import { hash } from '@companix/utils-js'
import { Viewport, ViewportProps, ViewportRef } from './Viewport'
import { useMemo, useRef } from 'react'

export interface ToastOptions {
  id?: string
  appearance?: 'primary' | 'neutral' | 'positive' | 'negative' | 'warning'
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
  closeIcon?: React.ReactNode
  closable?: boolean
}

export interface InnerToast extends ToastOptions {
  id: string
}

export const createToaster = (rootProps: ViewportProps = {}) => {
  const store: ViewportRef = {
    showToast: (toast: InnerToast) => {
      console.error('uninitialized', toast)
    }
  }

  return {
    api: {
      show: (toast: ToastOptions) => {
        const id = toast.id ?? hash()
        store.showToast({ ...toast, id })
        return id
      }
    },
    Viewport: (props: ViewportProps = {}) => {
      const ref = useRef<ViewportRef>(null)

      useMemo(() => {
        store.showToast = (value) => {
          if (ref.current) {
            ref.current.showToast(value)
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
