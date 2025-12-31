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
  showToast: (toast: InnerToast) => void
}

export const Viewport = forwardRef<ViewportRef, ViewportProps>((props, ref) => {
  const { side = 'top', align = 'center', gap = 14, duration, swipeThreshold, closeIcon } = props
  const [toasters, setToasters] = useState<InnerToast[]>([])

  const toastsRefs = useMemo((): { [id: string]: HTMLLIElement } => {
    return {}
  }, [])

  useImperativeHandle(
    ref,
    () => {
      return {
        showToast: (toast) => {
          setToasters((state) => {
            const nextState = [...state]
            const index = state.findIndex((u) => u.id === toast.id)

            if (index === -1) {
              // add new one
              nextState.push(toast)
            } else {
              // update existing one
              nextState[index] = toast
            }

            return nextState
          })
        }
      }
    },
    []
  )

  const applyOffsets = useCallback((toasters: InnerToast[]) => {
    toasters.forEach(({ id }, index) => {
      let offset = 0

      for (let i = index + 1; i < toasters.length; i++) {
        if (toastsRefs[toasters[i].id]) {
          offset += toastsRefs[toasters[i].id].clientHeight + gap
        }
      }

      if (toastsRefs[id]) {
        toastsRefs[id].style.setProperty('--offset', `${offset}px`)
      }
    })
  }, [])

  const dropToast = (id: string) => {
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
      swipeThreshold={swipeThreshold}
      swipeDirection={SwipesDirections[`${side}-${align}`]}
    >
      {toasters.map(({ id, ...toast }) => (
        <Toast
          {...toast}
          id={id}
          key={`toaster-${id}`}
          duration={toast.duration ?? duration}
          closeIcon={closeIcon}
          onInitialized={(ref) => {
            toastsRefs[id] = ref
            applyOffsets(toasters)
          }}
          onClosing={() => {
            delete toastsRefs[id]
            applyOffsets(toasters)
          }}
          onClosed={() => dropToast(id)}
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
