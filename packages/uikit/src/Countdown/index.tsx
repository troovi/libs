import { useRerender } from '../__hooks/use-rerender'
import { getNextCandleTime, getTimes } from '@companix/utils-js'
import { useEffect, useRef } from 'react'

const formatTime = (num: number) => String(num).padStart(2, '0')

export interface CountDownProps {
  expiration: number
  separator?: string
  onExpired?: VoidFunction
}

export const Countdown = ({ expiration, separator = ':', onExpired }: CountDownProps) => {
  const ref = useRef<null | ReturnType<typeof setInterval>>(null)
  const rerender = useRerender()

  useEffect(() => {
    const currentTime = Date.now()
    const closestNextSecondTimestamp = getNextCandleTime(currentTime, '1s')
    const waitToNextSecond = closestNextSecondTimestamp - currentTime

    const stop = () => {
      if (ref.current) {
        clearInterval(ref.current)
        ref.current = null
      }
    }

    const tick = () => {
      rerender()

      if (Date.now() >= expiration) {
        stop()
      }
    }

    // ожидание ровной секунды — таймером, а не промисом: очистка отменяет и его, поэтому интервал не переживает
    // размонтирование или смену `expiration`; истёкший отсчёт интервал не заводит
    const timeout = setTimeout(() => {
      tick()

      if (Date.now() < expiration) {
        ref.current = setInterval(tick, 1000)
      }
    }, waitToNextSecond)

    return () => {
      clearTimeout(timeout)
      stop()
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
