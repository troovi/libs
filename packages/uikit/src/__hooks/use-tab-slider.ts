import { useEffect, useState } from 'react'

export interface SliderOptions {
  baseId: string
  value: string | number
  containerRef: React.RefObject<HTMLDivElement>
}

export const useTabSlider = ({ baseId, value, containerRef }: SliderOptions) => {
  const [styles, setStyles] = useState<React.CSSProperties>({})

  useEffect(() => {
    const state = { observer: null as null | ResizeObserver }

    if (containerRef.current) {
      const tabIdSelector = `#${makeTabId(baseId, value)}`
      const selectedTabElement = containerRef.current.querySelector<HTMLElement>(tabIdSelector)

      if (selectedTabElement != null) {
        state.observer = new ResizeObserver(() => {
          const { clientHeight, clientWidth, offsetLeft, offsetTop } = selectedTabElement

          setStyles({
            width: clientWidth,
            height: clientHeight,
            transform: `translateX(${Math.floor(offsetLeft)}px) translateY(${Math.floor(offsetTop)}px)`
          })
        })

        state.observer.observe(selectedTabElement)
      } else {
        setStyles({ display: 'none' })
      }
    }

    return () => {
      if (state.observer) {
        state.observer.disconnect()
      }
    }
  }, [value])

  return styles
}

export const makeTabId = (baseId: string, value: string | number) => {
  return `uikit-tab-${baseId}-trigger-${value}`
}
