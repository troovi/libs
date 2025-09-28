import { getNextCandleTime, getTimes, sleep } from '@troovi/utils-js'
import { useState, useEffect, useRef } from 'react'

const formatTime = (num: number) => String(num).padStart(2, '0')

interface CountDownProps {
  expiration: number
  separator?: string
  onExpired?: VoidFunction
}

export const Countdown = ({ expiration, separator = ':', onExpired }: CountDownProps) => {
  const ref = useRef<null | NodeJS.Timeout>(null)
  const [, rerender] = useState([])

  useEffect(() => {
    const currentTime = Date.now()
    const closestNextSecondTimestamp = getNextCandleTime(currentTime, '1s')
    const waitToNextSecond = closestNextSecondTimestamp - currentTime

    if (ref.current) {
      clearInterval(ref.current)
    }

    sleep(waitToNextSecond).then(() => {
      rerender([])

      ref.current = setInterval(() => {
        rerender([])
      }, 1000)
    })

    return () => {
      if (ref.current) {
        clearInterval(ref.current)
      }
    }
  }, [expiration])

  const time = expiration - Date.now()
  const { hours, minutes, seconds } = getTimes(time)

  useEffect(() => {
    if (time <= 0) {
      onExpired?.()

      if (ref.current) {
        clearInterval(ref.current)
      }
    }
  }, [time <= 0])

  return <>{[formatTime(hours), formatTime(minutes), formatTime(seconds)].join(separator)}</>
}
