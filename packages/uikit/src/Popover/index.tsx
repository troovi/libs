import './Popover.scss'
import cn from 'classnames'
import * as Headless from '@headlessui/react'
import { useButtonWidth, usePopoverLeftValue } from '../__hooks/use-popover-position'

type Align = 'start' | 'end'
type Placement = 'top' | 'right' | 'bottom' | 'left'
type AnchorTo = `${Placement}` | `${Placement} ${Align}`

interface PopoverProps {
  children: (props: { 'aria-expanded': boolean }) => React.ReactNode
  content: ({ close }: { close: () => void }) => React.ReactNode
  placement?: AnchorTo
  popoverClassName?: string
  className?: string
  arrows?: boolean
}

export const Popover = (props: PopoverProps) => {
  const { children, className, content, popoverClassName, placement, arrows } = props
  const { popoverRef, getLeftValue } = usePopoverLeftValue()

  return (
    <Headless.Popover className={className}>
      {({ close }) => (
        <>
          <Headless.PopoverButton as={children as () => JSX.Element} />
          <Headless.PopoverPanel
            ref={popoverRef}
            style={{ ['--prev-left' as string]: getLeftValue() }}
            anchor={{ to: placement, gap: '11px' }}
            className={cn('popover', popoverClassName)}
            transition
          >
            {arrows && <div className="popover-arrow" />}
            {content({ close })}
          </Headless.PopoverPanel>
        </>
      )}
    </Headless.Popover>
  )
}

export const PopoverMinimal = ({ children, content, popoverClassName }: PopoverProps) => {
  const { buttonRef, getWidthValue } = useButtonWidth()
  const { popoverRef, getLeftValue } = usePopoverLeftValue()

  return (
    <Headless.Popover>
      {({ close }) => (
        <>
          <Headless.PopoverButton ref={buttonRef} as={children as () => JSX.Element} />
          <Headless.PopoverPanel
            ref={popoverRef}
            style={{
              ['--button-w' as string]: getWidthValue(),
              ['--prev-left' as string]: getLeftValue()
            }}
            anchor="bottom"
            className={cn('select-popup', popoverClassName)}
            transition
          >
            {content({ close })}
          </Headless.PopoverPanel>
        </>
      )}
    </Headless.Popover>
  )
}

export type { AnchorTo }
