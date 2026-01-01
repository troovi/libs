import { useLayoutEffect, useState } from 'react'

export const SCSSReady = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      setReady(true)
    })
  }, [])

  if (ready) {
    return children
  }

  return null
}
