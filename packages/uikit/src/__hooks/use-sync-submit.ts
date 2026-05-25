import { useRef } from 'react'
import { useRerender } from './use-rerender'

export const useSyncSubmit = (isSubmitted: boolean): [boolean, (isSubmitted: boolean) => void] => {
  const rerender = useRerender()
  const ref = useRef(isSubmitted)

  return [
    ref.current,
    (isSubmitted) => {
      ref.current = isSubmitted
      rerender()
    }
  ]
}
