import { PopoverButton } from '@headlessui/react'
import { useRef, useEffect } from 'react'

interface Options {
  close: () => void
  isOpen: boolean
  debounce: number
}

const useHover = ({ isOpen, close, debounce }: Options) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const clean = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      clean()
    }
  }, [close])

  return {
    buttonRef,
    onMouseEnter: () => {
      clean()

      if (!isOpen) {
        buttonRef.current?.click()
      }
    },
    onMouseLeave: () => {
      clean()

      timeoutRef.current = setTimeout(() => {
        close()
      }, debounce)
    }
  }
}

export const HoverTrap = ({ children, ...options }: Options & { children: () => JSX.Element }) => {
  const { onMouseLeave, onMouseEnter, buttonRef } = useHover(options)

  return <PopoverButton as={children} ref={buttonRef} {...{ onMouseLeave, onMouseEnter }} />
}
