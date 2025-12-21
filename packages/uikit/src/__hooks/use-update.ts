import { useEffect, useLayoutEffect, useRef } from 'react'

export const useLayoutAndUpdate = (callback: () => void, deps?: React.DependencyList | undefined) => {
  const isRendered = useRef(false)

  useLayoutEffect(() => {
    isRendered.current = true
    callback()
  }, [])

  useEffect(() => {
    if (isRendered.current) {
      isRendered.current = false
      return
    }

    callback()
  }, deps)
}
