import { useCallback, useRef } from 'react'
import { useEffectWithLayout } from './use-update'

const useInputPadding = (inputRef: React.RefObject<HTMLInputElement>, deps?: React.DependencyList) => {
  const rightRef = useRef<HTMLSpanElement>(null)
  const leftRef = useRef<HTMLSpanElement>(null)

  const elements = { Right: rightRef, Left: leftRef }

  const updateInputWidth = useCallback((side: 'Left' | 'Right') => {
    if (inputRef.current) {
      const input = inputRef.current.style
      const element = elements[side]

      if (element.current && element.current.clientWidth) {
        if (input[`padding${side}`] !== `${element.current.clientWidth}px`) {
          input[`padding${side}`] = `${element.current.clientWidth}px`
        }
      } else {
        if (input[`padding${side}`]) {
          input[`padding${side}`] = ''
        }
      }
    }
  }, [])

  useEffectWithLayout(() => {
    updateInputWidth('Left')
    updateInputWidth('Right')
  }, deps)

  return { rightRef, leftRef }
}

export { useInputPadding }
