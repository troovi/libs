import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'

const DEFAULT_INTERVAL = 60000

type TimestampCallback = (timestamp: number) => void
type RegisterCallback = (interval: number, callback: TimestampCallback) => () => void

interface IntervalData {
  intervalId: number
  callbacks: Set<TimestampCallback>
}

const NowContext = createContext<RegisterCallback | null>(null)

export const NowContextProvider = ({ children }: { children: ReactNode }) => {
  const intervalsRef = useRef<Map<number, IntervalData>>(new Map())

  const registerCallback = useCallback<RegisterCallback>(
    (interval: number, callback: TimestampCallback) => {
      let intervalData = intervalsRef.current.get(interval)

      if (!intervalData) {
        intervalData = {
          intervalId: window.setInterval(() => {
            const now = Date.now()
            intervalData?.callbacks.forEach((cb) => cb(now))
          }, interval),
          callbacks: new Set()
        }
        intervalsRef.current.set(interval, intervalData)
      }

      intervalData.callbacks.add(callback)

      return () => {
        const data = intervalsRef.current.get(interval)

        if (data) {
          data.callbacks.delete(callback)

          if (data.callbacks.size === 0) {
            window.clearInterval(data.intervalId)
            intervalsRef.current.delete(interval)
          }
        }
      }
    },
    []
  )

  return <NowContext.Provider value={registerCallback}>{children}</NowContext.Provider>
}

const useNowCallback = () => {
  const registerCallback = useContext(NowContext)

  if (registerCallback === null) {
    throw new Error('NowContextProvider is not provided')
  }

  return registerCallback
}

export const useNow = (interval: number = DEFAULT_INTERVAL): number => {
  const [now, setNow] = useState(() => Date.now())
  const registerCallback = useNowCallback()

  useEffect(() => {
    return registerCallback(interval, setNow)
  }, [interval, registerCallback])

  return now
}
