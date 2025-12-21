import { useCallback, useRef } from 'react'

type ResizeText = [React.RefObject<HTMLTextAreaElement>, () => void]

const useResizeTextarea = (
  onResize: ((el: HTMLTextAreaElement) => void) | undefined,
  grow: boolean
): ResizeText => {
  const elementRef = useRef<HTMLTextAreaElement>(null)
  const currentScrollHeight = useRef<number>(undefined)

  const resizeElement = useCallback(
    (el: HTMLTextAreaElement) => {
      if (grow && el.offsetParent) {
        el.style.height = ''
        el.style.height = `${el.scrollHeight}px`

        if (el.scrollHeight !== currentScrollHeight.current && onResize) {
          onResize(el)
          currentScrollHeight.current = el.scrollHeight
        }
      }
    },
    [grow, onResize]
  )

  const resize = useCallback(() => {
    const el = elementRef.current

    if (!el) {
      /* istanbul ignore next: нет возможности воспроизвести */
      return
    }

    resizeElement(el)
  }, [elementRef, resizeElement])

  return [elementRef, resize]
}

export { useResizeTextarea }
