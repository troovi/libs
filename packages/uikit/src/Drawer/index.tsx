import './Drawer.scss'
import { createPortal } from 'react-dom'
import { Transition } from '@headlessui/react'
import cn from 'classnames'

export const Drawer = (props: DrawerOptions) => {
  return createPortal(<Renderer {...props} />, document.body)
}

interface DrawerOptions {
  isOpen: boolean
  size: string
  onClose: () => void
  onClosed?: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  backdropStyle?: React.CSSProperties
}

const Renderer = ({ children, isOpen, onClose, onClosed, ...restProps }: DrawerOptions) => {
  const { size, style, backdropStyle, className } = restProps

  return (
    <div className="overlay overlay-container">
      <Transition show={isOpen}>
        <div onClick={onClose} className="drawer-backdrop" style={backdropStyle} />
      </Transition>
      <Transition afterLeave={onClosed} show={isOpen}>
        <div
          style={{ width: size, ...style }}
          className={cn('drawer drawer-right overlay-content', className)}
        >
          {children}
        </div>
      </Transition>
    </div>
  )
}
