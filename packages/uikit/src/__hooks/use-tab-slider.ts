import { useEffect, useState } from 'react'

export interface SliderOptions {
  baseId: string
  value: string | number
  containerRef: React.RefObject<HTMLDivElement>
}

export const useTabSlider = ({ baseId, value, containerRef }: SliderOptions) => {
  // до первого замера ползунок скрыт: иначе при монтировании он «выезжает» от левого края
  const [styles, setStyles] = useState<React.CSSProperties>({ display: 'none' })

  // useEffect, а не useLayoutEffect: ползунок — ребёнок контейнера, а layout-эффекты детей выполняются раньше, чем
  // React присвоит ref контейнеру, — при монтировании containerRef.current ещё пуст
  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const measure = () => {
      // по id, а не селектором `#…`: значение с пробелом или точкой ломает селектор
      const selected = document.getElementById(makeTabId(baseId, value))

      if (!selected || !container.contains(selected)) {
        setStyles({ display: 'none' })
        return
      }

      const { clientHeight, clientWidth, offsetLeft, offsetTop } = selected

      setStyles({
        width: clientWidth,
        height: clientHeight,
        transform: `translateX(${Math.floor(offsetLeft)}px) translateY(${Math.floor(offsetTop)}px)`
      })
    }

    // выбранный пункт сдвигается и без смены своего размера — когда меняется ширина соседей (счётчики в подписях),
    // поэтому наблюдаются контейнер и все пункты
    const observer = new ResizeObserver(measure)
    const items = container.querySelectorAll(`[id^="${makeTabId(baseId, '')}"]`)

    observer.observe(container)
    items.forEach((item) => observer.observe(item))
    measure()

    return () => {
      observer.disconnect()
    }
  }, [baseId, value])

  return styles
}

export const makeTabId = (baseId: string, value: string | number) => {
  return `uikit-tab-${baseId}-trigger-${value}`
}
