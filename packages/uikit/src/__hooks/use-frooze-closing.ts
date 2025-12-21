import { useCallback, useRef } from 'react'

// При смене выбранного значения в select-компоненте может измениться ширина кнопки.
// Это приводит к пересчёту позиции popover, привязанного к её размерам и координатам.
// Во время анимированного закрытия popover это способно вызвать нежелательные визуальные артефакты.

// Чтобы запретить данное поведение, разработан хук useFroozeClosing, который фиксирует и применяет значения ширины и позиции открытого popover-окна перед событием закрытия.

export const useFroozeClosing = () => {
  const popoverRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{ cb: null | (() => void) }>({ cb: null })

  const froozePopoverPosition = useCallback(() => {
    if (popoverRef.current && popoverRef.current.parentElement) {
      const parent = popoverRef.current.parentElement

      const width = parent.style.getPropertyValue('--radix-popper-anchor-width')
      const position = parent.style.getPropertyValue('transform')

      const observer = new MutationObserver(() => {
        if (parent.style.transform !== position) {
          parent.style.setProperty('transform', position)
        }
      })

      observer.observe(parent, {
        attributes: true,
        attributeFilter: ['style']
      })

      stateRef.current.cb = () => {
        observer.disconnect()
      }

      popoverRef.current.style.setProperty('--radix-popover-trigger-width', width)
    }
  }, [])

  const handleAnimationEnd = useCallback(() => {
    if (stateRef.current.cb) {
      stateRef.current.cb()
      stateRef.current.cb = null
    }
  }, [])

  return {
    popoverRef,
    handleAnimationEnd,
    froozePopoverPosition
  }
}
