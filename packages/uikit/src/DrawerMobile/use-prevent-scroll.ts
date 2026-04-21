// This code comes from https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/overlays/src/usePreventScroll.ts
// Adapted from vaul (https://github.com/emilkowalski/vaul) to keep only the iOS branch used by MobileDrawer.

import { useEffect, useLayoutEffect } from 'react'
import { isIOS, isInput } from './helpers'

const KEYBOARD_BUFFER = 24

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface PreventScrollOptions {
  isDisabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chain(...callbacks: any[]): (...args: any[]) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        callback(...args)
      }
    }
  }
}

const visualViewport = typeof document !== 'undefined' ? window.visualViewport : null

function isScrollable(node: Element): boolean {
  const style = window.getComputedStyle(node)
  return /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY)
}

function getScrollParent(node: Element): Element {
  if (isScrollable(node)) {
    node = node.parentElement as HTMLElement
  }

  while (node && !isScrollable(node)) {
    node = node.parentElement as HTMLElement
  }

  return node || document.scrollingElement || document.documentElement
}

let preventScrollCount = 0
let restore: () => void

export function usePreventScroll(options: PreventScrollOptions = {}) {
  const { isDisabled } = options

  useIsomorphicLayoutEffect(() => {
    if (isDisabled) {
      return
    }

    preventScrollCount++
    if (preventScrollCount === 1) {
      if (isIOS()) {
        restore = preventScrollMobileSafari()
      }
    }

    return () => {
      preventScrollCount--
      if (preventScrollCount === 0) {
        restore?.()
      }
    }
  }, [isDisabled])
}

// Mobile Safari is a whole different beast. Even with overflow: hidden,
// it still scrolls the page in many situations. We prevent those behaviors with
// a mix of touch and focus event interception, matching vaul's reference implementation.
function preventScrollMobileSafari() {
  let scrollable: Element
  let lastY = 0

  const onTouchStart = (e: TouchEvent) => {
    scrollable = getScrollParent(e.target as Element)
    if (scrollable === document.documentElement && scrollable === document.body) {
      return
    }

    lastY = e.changedTouches[0].pageY
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!scrollable || scrollable === document.documentElement || scrollable === document.body) {
      e.preventDefault()
      return
    }

    const y = e.changedTouches[0].pageY
    const scrollTop = scrollable.scrollTop
    const bottom = scrollable.scrollHeight - scrollable.clientHeight

    if (bottom === 0) {
      return
    }

    if ((scrollTop <= 0 && y > lastY) || (scrollTop >= bottom && y < lastY)) {
      e.preventDefault()
    }

    lastY = y
  }

  const onTouchEnd = (e: TouchEvent) => {
    const target = e.target as HTMLElement

    if (isInput(target) && target !== document.activeElement) {
      e.preventDefault()

      target.style.transform = 'translateY(-2000px)'
      target.focus()
      requestAnimationFrame(() => {
        target.style.transform = ''
      })
    }
  }

  const onFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement
    if (isInput(target)) {
      target.style.transform = 'translateY(-2000px)'
      requestAnimationFrame(() => {
        target.style.transform = ''

        if (visualViewport) {
          if (visualViewport.height < window.innerHeight) {
            requestAnimationFrame(() => {
              scrollIntoView(target)
            })
          } else {
            visualViewport.addEventListener('resize', () => scrollIntoView(target), { once: true })
          }
        }
      })
    }
  }

  const onWindowScroll = () => {
    window.scrollTo(0, 0)
  }

  const scrollX = window.pageXOffset
  const scrollY = window.pageYOffset

  const restoreStyles = chain(
    setStyle(document.documentElement, 'paddingRight', `${window.innerWidth - document.documentElement.clientWidth}px`)
  )

  window.scrollTo(0, 0)

  const removeEvents = chain(
    addEvent(document, 'touchstart', onTouchStart, { passive: false, capture: true }),
    addEvent(document, 'touchmove', onTouchMove, { passive: false, capture: true }),
    addEvent(document, 'touchend', onTouchEnd, { passive: false, capture: true }),
    addEvent(document, 'focus', onFocus, true),
    addEvent(window, 'scroll', onWindowScroll)
  )

  return () => {
    restoreStyles()
    removeEvents()
    window.scrollTo(scrollX, scrollY)
  }
}

function setStyle(element: HTMLElement, style: keyof React.CSSProperties, value: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cur = (element.style as any)[style]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(element.style as any)[style] = value

  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(element.style as any)[style] = cur
  }
}

function addEvent<K extends keyof GlobalEventHandlersEventMap>(
  target: EventTarget,
  event: K,
  handler: (this: Document, ev: GlobalEventHandlersEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target.addEventListener(event, handler as any, options)

  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target.removeEventListener(event, handler as any, options)
  }
}

function scrollIntoView(target: Element) {
  const root = document.scrollingElement || document.documentElement
  let current: Element | null = target
  while (current && current !== root) {
    const scrollable = getScrollParent(current)
    if (scrollable !== document.documentElement && scrollable !== document.body && scrollable !== current) {
      const scrollableTop = scrollable.getBoundingClientRect().top
      const targetTop = current.getBoundingClientRect().top
      const targetBottom = current.getBoundingClientRect().bottom
      const keyboardHeight = scrollable.getBoundingClientRect().bottom + KEYBOARD_BUFFER

      if (targetBottom > keyboardHeight) {
        scrollable.scrollTop += targetTop - scrollableTop
      }
    }

    current = scrollable.parentElement
  }
}
