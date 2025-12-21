import { useRef } from 'react'

export const usePrevious = <T>(value: T) => {
  const currentRef = useRef(value)
  const previousRef = useRef<T>()

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current
    currentRef.current = value
  }

  return previousRef.current
}

export const usePreviousChanged = <T>(value: T) => {
  const currentRef = useRef(value)
  const previousRef = useRef<T>()

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current
    currentRef.current = value
  }

  return previousRef.current
}
