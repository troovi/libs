import { useEffect, useRef } from 'react'

export const RemoveListener = ({ callback }: { callback?: () => void }) => {
  // последний переданный колбэк: замыкание первого рендера к закрытию устаревает
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  useEffect(() => {
    return () => {
      callbackRef.current?.()
    }
  }, [])

  return null
}
