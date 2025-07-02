import { useRef } from 'react'
import { px } from '@troovi/utils-browser'

export const usePopoverLeftValue = () => {
  const popoverRef = useRef<HTMLDivElement>(null)

  return {
    popoverRef,
    getLeftValue: () => {
      return popoverRef.current?.style.left ?? '0px'
    }
  }
}

export const useButtonWidth = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return {
    buttonRef,
    getWidthValue: () => {
      return px(buttonRef.current?.offsetWidth ?? 0)
    }
  }
}
