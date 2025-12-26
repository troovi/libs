import cn from 'classnames'

import { useRef, useLayoutEffect, useMemo, useCallback, useEffect } from 'react'
import { getContainers, pc, px } from '@troovi/utils-browser'

interface Props {
  children: React.ReactNode
  thumbClassName: string
  thumbColor?: string
  trackWidth?: number
  thumbMargin?: number
  scrollableClassName?: string
}

// Отслеживание изменений scrollHeight:
// https://stackoverflow.com/questions/44428370/detect-scrollheight-change-with-mutationobserver

const ImitateScroll = ({
  children,
  thumbClassName,
  scrollableClassName,
  thumbMargin = 0,
  trackWidth = 20
}: Props) => {
  const scrollThumbRef = useRef<HTMLDivElement>(null)
  const scrollableRef = useRef<HTMLDivElement>(null)

  const data = useMemo(() => {
    return { positons: { top: 0, y: 0 }, scrollRatio: 0 }
  }, [])

  const listeners = useMemo(() => {
    return {
      start() {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      },
      clear() {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver(setThumbHeight)

    if (scrollableRef.current) {
      getContainers(scrollableRef.current, (element) => {
        observer.observe(element)
      })
    }

    return () => {
      if (scrollableRef.current) {
        getContainers(scrollableRef.current, (element) => {
          observer.unobserve(element)
        })
      }
    }
  }, [])

  useLayoutEffect(() => {
    setThumbHeight()
  }, [])

  const setThumbHeight = useCallback(() => {
    const { current: container } = scrollableRef
    const { current: thumb } = scrollThumbRef

    if (thumb && container) {
      const scrollRatio = container.clientHeight / container.scrollHeight

      thumb.style.height = pc(scrollRatio * 100)
      thumb.style.display = scrollRatio === 1 ? 'none' : 'block'

      data.scrollRatio = scrollRatio
    }
  }, [])

  const handleMouseMove = useCallback(({ clientY }: MouseEvent) => {
    const { current: container } = scrollableRef

    if (container) {
      const dy = clientY - data.positons.y
      container.scrollTop = data.positons.top + dy / data.scrollRatio
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    listeners.clear()
  }, [])

  const handleMouseDown = useCallback(({ clientY }: React.MouseEvent) => {
    const { current: container } = scrollableRef

    if (container) {
      data.positons = {
        top: container.scrollTop,
        y: clientY
      }
    }

    listeners.start()
  }, [])

  const handleScroll = () => {
    requestAnimationFrame(() => {
      const { current: container } = scrollableRef
      const { current: thumb } = scrollThumbRef

      if (thumb && container) {
        thumb.style.top = pc((container.scrollTop * 100) / container.scrollHeight)
      }
    })
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={cn('hidden-scroll h-full overflow-y-scroll', scrollableClassName)}
        onScroll={handleScroll}
        ref={scrollableRef}
      >
        {children}
      </div>
      <div
        className="absolute right-0 top-0 box-border h-full"
        style={{ width: px(trackWidth), padding: px(thumbMargin) }}
      >
        <div
          onMouseDown={handleMouseDown}
          className={`${thumbClassName} relative w-full rounded-full`}
          ref={scrollThumbRef}
        />
      </div>
    </div>
  )
}

export { ImitateScroll }
