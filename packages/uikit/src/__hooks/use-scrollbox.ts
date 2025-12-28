import { useCallback, useRef } from 'react'

interface UseScrollListControllerReturn {
  scrollBoxRef: React.RefObject<HTMLDivElement>
  optionsWrapperRef: React.RefObject<HTMLDivElement>
  scrollToElement: (index: number, position?: 'center' | 'top') => void
}

export const useScrollListController = (): UseScrollListControllerReturn => {
  const scrollBoxRef = useRef<HTMLDivElement>(null)
  const optionsWrapperRef = useRef<HTMLDivElement>(null)

  const scrollToElement = useCallback(
    (index: number, position?: 'center' | 'top') => {
      const dropdown = scrollBoxRef.current
      const optionsWrapper = optionsWrapperRef.current

      if (!dropdown || !optionsWrapper || index < 0 || index > optionsWrapper.children.length) {
        return
      }

      const item = optionsWrapper.children[index] as HTMLElement | null
      /* istanbul ignore if: проверка для TS (ситуация, когда среди children нет элемента с index, маловероятна) */
      if (!item) {
        return
      }

      const dropdownHeight = dropdown.offsetHeight
      const scrollTop = dropdown.scrollTop
      const itemTop = item.offsetTop
      const itemHeight = item.offsetHeight

      if (position === 'center') {
        dropdown.scrollTop = itemTop - dropdownHeight / 2 + itemHeight / 2
      } else if (position === 'top') {
        dropdown.scrollTop = itemTop
      } else if (itemTop + itemHeight > dropdownHeight + scrollTop) {
        dropdown.scrollTop = itemTop - dropdownHeight + itemHeight
      } else if (itemTop < scrollTop) {
        dropdown.scrollTop = itemTop
      }
    },
    [optionsWrapperRef, scrollBoxRef]
  )

  return { scrollToElement, scrollBoxRef, optionsWrapperRef }
}
