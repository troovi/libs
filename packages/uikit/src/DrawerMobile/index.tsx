import React from 'react'
import cn from 'classnames'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { customCSS } from '@companix/utils-browser'
import { RemoveListener } from '../__utils/RemoveListener'
import { DrawerContext, useDrawerContext } from './context'
import {
  composeRefs,
  dampenValue,
  getTranslate,
  isInput,
  isIOS,
  isMobileFirefox,
  reset,
  set
} from './helpers'
import { usePreventScroll } from './use-prevent-scroll'
import {
  CLOSE_THRESHOLD,
  DRAG_CLASS,
  SCROLL_LOCK_TIMEOUT,
  TRANSITIONS,
  VELOCITY_THRESHOLD,
  WINDOW_TOP_OFFSET
} from './constants'
import type { MobileDrawerContentProps, MobileDrawerOverlayProps } from './types'

export interface MobileDrawerProps {
  open: boolean
  className?: string
  onOpenChange: (value: boolean) => void
  children: React.ReactNode
  defaultOpen?: boolean
  disableEsc?: boolean
  onClosed?: () => void
  size?: string
}

const Root = (props: MobileDrawerProps) => {
  const { open: openProp, onOpenChange, onClosed, children, defaultOpen = false, disableEsc } = props

  const [hasBeenOpened, setHasBeenOpened] = React.useState<boolean>(false)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [justReleased, setJustReleased] = React.useState<boolean>(false)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const openTime = React.useRef<Date | null>(null)
  const dragStartTime = React.useRef<Date | null>(null)
  const dragEndTime = React.useRef<Date | null>(null)
  const lastTimeDragPrevented = React.useRef<Date | null>(null)
  const isAllowedToDrag = React.useRef<boolean>(false)
  const pointerStart = React.useRef(0)
  const keyboardIsOpen = React.useRef(false)
  const shouldAnimate = React.useRef(!defaultOpen)
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const drawerHeightRef = React.useRef(drawerRef.current?.getBoundingClientRect().height || 0)
  const initialDrawerHeight = React.useRef(0)
  const previousDiffFromInitial = React.useRef(0)

  const isOpen = openProp ?? false

  const setIsOpen = React.useCallback(
    (o: boolean) => {
      onOpenChange(o)
    },
    [onOpenChange]
  )

  usePreventScroll({
    isDisabled: !isOpen || isDragging || justReleased || !hasBeenOpened
  })

  const onPress = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) return

    drawerHeightRef.current = drawerRef.current?.getBoundingClientRect().height || 0
    setIsDragging(true)
    dragStartTime.current = new Date()

    // iOS doesn't trigger mouseUp after scrolling so we need to listen to touched in order to disallow dragging
    if (isIOS()) {
      window.addEventListener('touchend', () => (isAllowedToDrag.current = false), { once: true })
    }
    // Ensure we maintain correct pointer capture even when going outside of the drawer
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)

    pointerStart.current = event.pageY
  }

  const shouldDrag = (el: EventTarget, isDraggingInDirection: boolean) => {
    let element = el as HTMLElement
    const highlightedText = window.getSelection()?.toString()
    const swipeAmount = drawerRef.current ? getTranslate(drawerRef.current) : null
    const date = new Date()

    if (element.tagName === 'SELECT') {
      return false
    }

    if (element.hasAttribute('data-no-drag') || element.closest('[data-no-drag]')) {
      return false
    }

    // Allow scrolling when animating
    if (openTime.current && date.getTime() - openTime.current.getTime() < 500) {
      return false
    }

    if (swipeAmount !== null) {
      if (swipeAmount > 0) {
        return true
      }
    }

    // Don't drag if there's highlighted text
    if (highlightedText && highlightedText.length > 0) {
      return false
    }

    // Disallow dragging if drawer was scrolled within `SCROLL_LOCK_TIMEOUT`
    if (
      lastTimeDragPrevented.current &&
      date.getTime() - lastTimeDragPrevented.current.getTime() < SCROLL_LOCK_TIMEOUT &&
      swipeAmount === 0
    ) {
      lastTimeDragPrevented.current = date
      return false
    }

    if (isDraggingInDirection) {
      lastTimeDragPrevented.current = date

      // We are dragging down so we should allow scrolling
      return false
    }

    // Keep climbing up the DOM tree as long as there's a parent
    while (element) {
      // Check if the element is scrollable
      if (element.scrollHeight > element.clientHeight) {
        if (element.scrollTop !== 0) {
          lastTimeDragPrevented.current = new Date()

          // The element is scrollable and not scrolled to the top, so don't drag
          return false
        }

        if (element.getAttribute('role') === 'dialog') {
          return true
        }
      }

      // Move up to the parent element
      element = element.parentNode as HTMLElement
    }

    return true
  }

  const onDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawerRef.current) {
      return
    }

    if (isDragging) {
      const draggedDistance = pointerStart.current - event.pageY
      const isDraggingInDirection = draggedDistance > 0

      const absDraggedDistance = Math.abs(draggedDistance)
      const drawerDimension = drawerHeightRef.current

      const percentageDragged = absDraggedDistance / drawerDimension

      if (!isAllowedToDrag.current && !shouldDrag(event.target, isDraggingInDirection)) return
      drawerRef.current.classList.add(DRAG_CLASS)
      isAllowedToDrag.current = true
      set(drawerRef.current, {
        transition: 'none'
      })

      set(overlayRef.current, {
        transition: 'none'
      })

      // Pulled upwards past the top: apply dampened resistance
      if (isDraggingInDirection) {
        const dampenedDraggedDistance = dampenValue(draggedDistance)

        const translateValue = Math.min(dampenedDraggedDistance * -1, 0) * 1
        set(drawerRef.current, {
          transform: `translate3d(0, ${translateValue}px, 0)`
        })
        return
      }

      const opacityValue = 1 - percentageDragged

      set(
        overlayRef.current,
        {
          opacity: `${opacityValue}`,
          transition: 'none'
        },
        true
      )

      const translateValue = absDraggedDistance

      set(drawerRef.current, {
        transform: `translate3d(0, ${translateValue}px, 0)`
      })
    }
  }

  React.useEffect(() => {
    window.requestAnimationFrame(() => {
      shouldAnimate.current = true
    })
  }, [])

  React.useEffect(() => {
    const onVisualViewportChange = () => {
      if (!drawerRef.current) return

      const focusedElement = document.activeElement as HTMLElement
      if (isInput(focusedElement) || keyboardIsOpen.current) {
        const visualViewportHeight = window.visualViewport?.height || 0
        const totalHeight = window.innerHeight
        // This is the height of the keyboard
        const diffFromInitial = totalHeight - visualViewportHeight
        const drawerHeight = drawerRef.current.getBoundingClientRect().height || 0
        // Adjust drawer height only if it's tall enough
        const isTallEnough = drawerHeight > totalHeight * 0.8

        if (!initialDrawerHeight.current) {
          initialDrawerHeight.current = drawerHeight
        }
        const offsetFromTop = drawerRef.current.getBoundingClientRect().top

        // visualViewport height may change due to some subtle changes to the keyboard. Checking if the height changed by 60 or more will make sure that they keyboard really changed its open state.
        if (Math.abs(previousDiffFromInitial.current - diffFromInitial) > 60) {
          keyboardIsOpen.current = !keyboardIsOpen.current
        }

        previousDiffFromInitial.current = diffFromInitial
        // We don't have to change the height if the input is in view, when we are here we are in the opened keyboard state so we can correctly check if the input is in view
        if (drawerHeight > visualViewportHeight || keyboardIsOpen.current) {
          const height = drawerRef.current.getBoundingClientRect().height
          let newDrawerHeight = height

          if (height > visualViewportHeight) {
            newDrawerHeight = visualViewportHeight - (isTallEnough ? offsetFromTop : WINDOW_TOP_OFFSET)
          }
          drawerRef.current.style.height = `${Math.max(
            newDrawerHeight,
            visualViewportHeight - offsetFromTop
          )}px`
        } else if (!isMobileFirefox()) {
          drawerRef.current.style.height = `${initialDrawerHeight.current}px`
        }

        // Negative bottom value would never make sense
        drawerRef.current.style.bottom = `${Math.max(diffFromInitial, 0)}px`
      }
    }

    window.visualViewport?.addEventListener('resize', onVisualViewportChange)
    return () => window.visualViewport?.removeEventListener('resize', onVisualViewportChange)
  }, [])

  const closeDrawer = (fromWithin?: boolean) => {
    cancelDrag()

    if (!fromWithin) {
      setIsOpen(false)
    }
  }

  const resetDrawer = () => {
    if (!drawerRef.current) return

    set(drawerRef.current, {
      transform: 'translate3d(0, 0, 0)',
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})`
    })

    set(overlayRef.current, {
      transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})`,
      opacity: '1'
    })
  }

  const cancelDrag = () => {
    if (!isDragging || !drawerRef.current) return

    drawerRef.current.classList.remove(DRAG_CLASS)
    isAllowedToDrag.current = false
    setIsDragging(false)
    dragEndTime.current = new Date()
  }

  const onRelease = (event: React.PointerEvent<HTMLDivElement> | null) => {
    if (!isDragging || !drawerRef.current) return

    drawerRef.current.classList.remove(DRAG_CLASS)
    isAllowedToDrag.current = false
    setIsDragging(false)
    dragEndTime.current = new Date()
    const swipeAmount = getTranslate(drawerRef.current)

    if (!event || !shouldDrag(event.target, false) || !swipeAmount || Number.isNaN(swipeAmount)) return

    if (dragStartTime.current === null) return

    const timeTaken = dragEndTime.current.getTime() - dragStartTime.current.getTime()
    const distMoved = pointerStart.current - event.pageY
    const velocity = Math.abs(distMoved) / timeTaken

    if (velocity > 0.05) {
      // `justReleased` is needed to prevent the drawer from focusing on an input when the drag ends, as it's not the intent most of the time.
      setJustReleased(true)

      setTimeout(() => {
        setJustReleased(false)
      }, 200)
    }

    // Moved upwards, don't do anything
    if (distMoved > 0) {
      resetDrawer()
      return
    }

    if (velocity > VELOCITY_THRESHOLD) {
      closeDrawer()
      return
    }

    const visibleDrawerHeight = Math.min(
      drawerRef.current.getBoundingClientRect().height ?? 0,
      window.innerHeight
    )

    if (Math.abs(swipeAmount) >= visibleDrawerHeight * CLOSE_THRESHOLD) {
      closeDrawer()
      return
    }

    resetDrawer()
  }

  React.useEffect(() => {
    if (isOpen) {
      set(document.documentElement, {
        scrollBehavior: 'auto'
      })

      openTime.current = new Date()
    }

    return () => {
      reset(document.documentElement, 'scrollBehavior')
    }
  }, [isOpen])

  return (
    <DialogPrimitive.Root
      defaultOpen={defaultOpen}
      onOpenChange={(open) => {
        if (open) {
          setHasBeenOpened(true)
        } else {
          closeDrawer(true)
        }

        setIsOpen(open)
      }}
      open={isOpen}
      modal
    >
      <DrawerContext.Provider
        value={{
          drawerRef,
          overlayRef,
          onPress,
          onRelease,
          onDrag,
          isOpen,
          isDragging,
          keyboardIsOpen,
          closeDrawer: () => closeDrawer(),
          shouldAnimate,
          onClosed,
          disableEsc
        }}
      >
        {children}
      </DrawerContext.Provider>
    </DialogPrimitive.Root>
  )
}

const Overlay = React.forwardRef<HTMLDivElement, MobileDrawerOverlayProps>(
  ({ className, ...rest }, ref) => {
    const { overlayRef, onRelease, shouldAnimate } = useDrawerContext()
    const composedRef = composeRefs(ref, overlayRef)
    const onMouseUp = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => onRelease(event),
      [onRelease]
    )

    return (
      <DialogPrimitive.Overlay
        onMouseUp={onMouseUp}
        ref={composedRef}
        data-animate={shouldAnimate?.current ? 'true' : 'false'}
        className={cn('popup-overlay drawer-overlay', className)}
        {...rest}
      />
    )
  }
)

const Content = React.forwardRef<HTMLDivElement, MobileDrawerContentProps>(
  ({ onPointerDownOutside, style, onOpenAutoFocus, className, size, children, ...rest }, ref) => {
    const {
      drawerRef,
      onPress,
      onRelease,
      onDrag,
      keyboardIsOpen,
      shouldAnimate,
      onClosed,
      disableEsc
    } = useDrawerContext()
    const composedRef = composeRefs(ref, drawerRef)
    const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null)
    const lastKnownPointerEventRef = React.useRef<React.PointerEvent<HTMLDivElement> | null>(null)
    const wasBeyondThePointRef = React.useRef(false)

    const isDeltaInDirection = (delta: { x: number; y: number }, threshold = 0) => {
      if (wasBeyondThePointRef.current) return true

      const deltaY = Math.abs(delta.y)
      const deltaX = Math.abs(delta.x)
      const isDeltaX = deltaX > deltaY

      const isReverseDirection = delta.y * 1 < 0
      if (!isReverseDirection && deltaY >= 0 && deltaY <= threshold) {
        return !isDeltaX
      }

      wasBeyondThePointRef.current = true
      return true
    }

    const handleOnPointerUp = (event: React.PointerEvent<HTMLDivElement> | null) => {
      pointerStartRef.current = null
      wasBeyondThePointRef.current = false
      onRelease(event)
    }

    return (
      <DialogPrimitive.Content
        data-direction="bottom"
        data-animate={shouldAnimate?.current ? 'true' : 'false'}
        className={cn('popup drawer drawer-mobile', className)}
        style={{ ...customCSS({ '--drawer-size': size ?? '50%' }), ...style }}
        {...rest}
        ref={composedRef}
        onPointerDown={(event) => {
          rest.onPointerDown?.(event)
          pointerStartRef.current = { x: event.pageX, y: event.pageY }
          onPress(event)
        }}
        onOpenAutoFocus={(e) => {
          onOpenAutoFocus?.(e)
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (disableEsc) {
            e.preventDefault()
          }
        }}
        onPointerDownOutside={(e) => {
          onPointerDownOutside?.(e)

          if (!e.defaultPrevented && keyboardIsOpen.current) {
            keyboardIsOpen.current = false
          }
        }}
        onPointerMove={(event) => {
          lastKnownPointerEventRef.current = event
          rest.onPointerMove?.(event)
          if (!pointerStartRef.current) return
          const yPosition = event.pageY - pointerStartRef.current.y
          const xPosition = event.pageX - pointerStartRef.current.x

          const swipeStartThreshold = event.pointerType === 'touch' ? 10 : 2
          const delta = { x: xPosition, y: yPosition }

          const isAllowedToSwipe = isDeltaInDirection(delta, swipeStartThreshold)
          if (isAllowedToSwipe) onDrag(event)
          else if (
            Math.abs(xPosition) > swipeStartThreshold ||
            Math.abs(yPosition) > swipeStartThreshold
          ) {
            pointerStartRef.current = null
          }
        }}
        onPointerUp={(event) => {
          rest.onPointerUp?.(event)
          pointerStartRef.current = null
          wasBeyondThePointRef.current = false
          onRelease(event)
        }}
        onPointerOut={(event) => {
          rest.onPointerOut?.(event)
          handleOnPointerUp(lastKnownPointerEventRef.current)
        }}
        onContextMenu={(event) => {
          rest.onContextMenu?.(event)
          if (lastKnownPointerEventRef.current) {
            handleOnPointerUp(lastKnownPointerEventRef.current)
          }
        }}
      >
        <RemoveListener callback={onClosed} />
        <VisuallyHidden>
          <DialogPrimitive.Title />
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogPrimitive.Description />
        </VisuallyHidden>
        {children}
      </DialogPrimitive.Content>
    )
  }
)

export const Handle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ children, ...rest }, ref) => {
    return (
      <div className="drawer-handle" aria-hidden="true" ref={ref} {...rest}>
        <span className="drawer-handle-hitarea" aria-hidden="true">
          {children}
        </span>
      </div>
    )
  }
)

export const MobileDrawer = ({ children, className, size, ...props }: MobileDrawerProps) => {
  return (
    <Root {...props}>
      <DialogPrimitive.Portal>
        <Overlay />
        <Content className={className} size={size}>
          {children}
        </Content>
      </DialogPrimitive.Portal>
    </Root>
  )
}

MobileDrawer.Close = DialogPrimitive.Close
MobileDrawer.Handle = Handle
