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

/**
 * То, что получает функция отрисовки кастомного тоста.
 */
export interface ToastRenderProps {
  id: string
  /**
   * Закрывает тост с анимацией — например, по клику на его содержимое.
   */
  close: () => void
}

export type ToastRender = (toast: ToastRenderProps) => React.ReactNode

/**
 * Параметры кастомного тоста: `icon`, `title` и `description` заменяет функция отрисовки.
 */
export type CustomToastOptions = Pick<
  ToastOptions,
  'id' | 'appearance' | 'duration' | 'closeIcon' | 'closable'
>

export interface InnerToast extends ToastOptions {
  id: string
  render?: ToastRender
}

export const createToaster = (rootProps: ViewportProps = {}) => {
  const store: ViewportRef = {
    showToast: (toast: InnerToast) => {
      console.error('uninitialized', toast)
    }
  }

  return {
    api: {
      standard: (toast: ToastOptions) => {
        const id = toast.id ?? hash()
        store.showToast({ ...toast, id })
        return id
      },
      /**
       * Показывает тост с собственной вёрсткой. Поверхность тоста (фон, рамка, тень, скругление,
       * ширина) берётся из темы, а всё внутреннее пространство без отступов отдаётся `render`.
       * Повторный вызов с тем же `id` обновляет показанный тост.
       */
      custom: (render: ToastRender, options: CustomToastOptions = {}) => {
        const id = options.id ?? hash()
        store.showToast({ ...options, id, render })
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
