import * as PopoverPrimitive from '@radix-ui/react-popover'
import { attr } from '@companix/utils-browser'
import classNames from 'classnames'
import { forwardRef, useRef } from 'react'

export type Align = 'start' | 'center' | 'end'
export type Side = 'top' | 'right' | 'bottom' | 'left'

export interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  triggerRef?: React.Ref<HTMLButtonElement>
  triggerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  onOpenChange?: (open: boolean) => void
  content: ({ close }: { close: () => void }) => React.ReactNode
  onAnimationEnd?: () => void
  onAnimationStart?: () => void
  onOpenAutoFocus?: (event: Event) => void
  onCloseAutoFocus?: (event: Event) => void
  side?: Side
  align?: Align
  showArrows?: boolean
  minimal?: boolean
  sideOffset?: number
  matchTarget?: 'width' | 'min-width'
  className?: string
  fitMaxHeight?: boolean
  disabled?: boolean
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>((props, ref) => {
  const {
    children,
    sideOffset,
    matchTarget,
    onAnimationEnd,
    onAnimationStart,
    onOpenAutoFocus,
    onCloseAutoFocus,
    triggerRef,
    triggerProps,
    open,
    content,
    onOpenChange,
    align,
    disabled,
    minimal,
    className,
    fitMaxHeight = true,
    side,
    showArrows
  } = props

  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    if (buttonRef.current) {
      buttonRef.current.click()
    }
  }

  const handleOpen = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault()
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger ref={triggerRef} {...triggerProps} onClick={handleOpen} asChild>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          className={classNames('popover', className)}
          side={side}
          align={align}
          data-appearance={minimal ? 'minimal' : 'default'}
          data-match-target={matchTarget}
          sideOffset={sideOffset ?? 6}
          avoidCollisions
          arrowPadding={10}
          onAnimationStart={onAnimationStart}
          onAnimationEnd={onAnimationEnd}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <PopoverPrimitive.Close ref={buttonRef} style={{ display: 'none' }} />
          {showArrows && (
            <PopoverPrimitive.Arrow width={30} height={11} asChild>
              <div className="popover-arrow">
                <svg className="popover-arrow-icon" viewBox="0 0 30 11" width={30} height={11}>
                  <path
                    className="popover-arrow-border"
                    d="M 18.112 -2.704 C 19.127 -3.64 19.999 -5.626 19.999 -7.001 L 19.999 18.999 C 19.999 17.621 19.131 15.642 18.111 14.702 L 10.927 8.084 C 9.69 6.944 9.694 5.05 10.927 3.914 L 18.112 -2.704 Z"
                    style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                    transform="matrix(0, -1, 1, 0, 0.000001, 0)"
                  />
                  <path
                    className="popover-arrow-fill"
                    d="M 17.789 -2.965 C 19.009 -4.09 19.999 -6.341 19.999 -7.995 L 19.999 -10.001 L 19.999 19.999 L 19.999 17.994 C 19.999 16.34 19.016 14.094 17.789 12.964 L 10.606 6.348 C 9.796 5.602 9.804 4.388 10.606 3.648 L 17.789 -2.966 L 17.789 -2.965 Z"
                    style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                    transform="matrix(0, -1, 1, 0, 0, 0)"
                  />
                </svg>
              </div>
            </PopoverPrimitive.Arrow>
          )}
          <div className="popover-content" data-fit-max-height={attr(fitMaxHeight)}>
            {content({ close })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
})
