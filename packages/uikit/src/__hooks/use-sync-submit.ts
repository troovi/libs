import { useRef } from 'react'
import { useRerender } from './use-rerender'

export const useSyncSubmit = (): [boolean, (isSubmitted: boolean) => void] => {
  const rerender = useRerender()
  const ref = useRef(false)

  return [
    ref.current,
    (isSubmitted) => {
      ref.current = isSubmitted
      rerender()
    }
  ]
}
