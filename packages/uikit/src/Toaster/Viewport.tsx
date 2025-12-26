import * as ToasterPrimitive from '@radix-ui/react-toast'
import { varToStyle } from '@companix/utils-browser'
import { useCallback, useMemo, useState, useImperativeHandle, forwardRef } from 'react'
import { Toast } from './Toast'
import { InnerToast } from '.'

enum SwipesDirections {
  'top-center' = 'up',
  'top-left' = 'left',
  'top-right' = 'right',
  'bottom-center' = 'down',
  'bottom-left' = 'left',
  'bottom-right' = 'right'
}

export interface ViewportProps {
  side?: 'top' | 'bottom'
  align?: 'center' | 'left' | 'right'
  gap?: number // gap between toasts
  swipeThreshold?: number
  duration?: number
  closeIcon?: React.ReactNode
}

export interface ViewportRef {
  addToast: (toast: InnerToast) => void
}

export const Viewport = forwardRef<ViewportRef, ViewportProps>((props, ref) => {
  const { side = 'top', align = 'center', gap = 14, duration, swipeThreshold, closeIcon } = props
  const [toasters, setToasters] = useState<InnerToast[]>([])

  const refs = useMemo((): { [id: string]: HTMLLIElement } => {
    return {}
  }, [])

  useImperativeHandle(
    ref,
    () => {
      return {
        addToast: (toast) => {
          setToasters((state) => [...state, toast])
        }
      }
    },
    []
  )

  const applyOffsets = useCallback((toasters: InnerToast[]) => {
    toasters.forEach(({ id }, index) => {
      let offset = 0

      for (let i = index + 1; i < toasters.length; i++) {
        if (refs[toasters[i].id]) {
          offset += refs[toasters[i].id].clientHeight + gap
        }
      }

      if (refs[id]) {
        refs[id].style.setProperty('--offset', `${offset}px`)
      }
    })
  }, [])

  const handleClose = (id: string) => {
    setToasters((state) => {
      const nextState = [...state]
      const index = nextState.findIndex((item) => item.id === id)

      if (index !== -1) {
        nextState.splice(index, 1)
      }

      return nextState
    })
  }

  return (
    <ToasterPrimitive.Provider
      duration={duration}
      swipeThreshold={swipeThreshold}
      swipeDirection={SwipesDirections[`${side}-${align}`]}
    >
      {toasters.map(({ id, ...toast }) => (
        <Toast
          {...toast}
          key={`toaster-${id}`}
          closeIcon={closeIcon}
          onInitialized={(ref) => {
            refs[id] = ref
            applyOffsets(toasters)
          }}
          onRemoving={() => {
            delete refs[id]
            applyOffsets(toasters)
          }}
          onRemoved={() => {
            if (refs[id]) {
              // Если коллбек onRemoved вызвается при истечении duration,
              // мы не перехватываем событие onRemoving и не изменяем позиции текущих тостов
              // (автоматическое закрытие тостов всегда происходит в порядке открытия)
              delete refs[id]
            }

            handleClose(id)
          }}
        />
      ))}
      <ToasterPrimitive.Viewport
        data-side={side}
        data-align={align}
        className="toaster-viewport"
        style={varToStyle({ '--toasters-gap': `${gap}px` })}
      />
    </ToasterPrimitive.Provider>
  )
})
