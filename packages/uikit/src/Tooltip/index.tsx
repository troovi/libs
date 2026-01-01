import { useState } from 'react'
import { Popover } from '..'
import { Side } from '../Popover'

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: Side
}

export const Tooltip = ({ children, content, side }: TooltipProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      showArrows
      className="tooltip"
      open={open}
      side={side}
      content={() => content}
      triggerProps={{
        onMouseEnter: () => {
          setOpen(true)
        },
        onMouseLeave: () => {
          setOpen(false)
        }
      }}
    >
      {children}
    </Popover>
  )
}
