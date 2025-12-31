import { useEffect } from 'react'

export const RemoveListener = ({ callback }: { callback?: () => void }) => {
  useEffect(() => {
    return () => {
      callback?.()
    }
  }, [])

  return null
}
