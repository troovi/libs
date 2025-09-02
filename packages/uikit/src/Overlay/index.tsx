import './Overlay.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Transition } from '@headlessui/react'
import { createPortal } from 'react-dom'
import { attr } from '@troovi/utils-browser'

export interface OverlayProps {
  isOpen: boolean
  onClose: () => void
  onClosed?: () => void
  backdropStyle?: React.CSSProperties
  children: React.ReactNode
}

export const Overlay = ({ onClosed, ...props }: OverlayProps) => {
  const ref = useRef({ show: false })
  const [, rerender] = useState([])

  if (ref.current.show || props.isOpen) {
    if (props.isOpen) {
      ref.current.show = true
      document.body.classList.add('overflow-hidden')
    }

    return createPortal(
      <Renderer
        {...props}
        onClosed={() => {
          ref.current.show = false
          document.body.classList.remove('overflow-hidden')
          onClosed?.()
          rerender([])
        }}
      />,
      document.body
    )
  }

  return null
}

interface DrawerOptions extends OverlayProps {
  onClosed?: () => void
}

const Renderer = ({ children, onClose, onClosed, ...restProps }: DrawerOptions) => {
  const [isRendered, setRender] = useState(false)

  useEffect(() => {
    setRender(true)
  }, [])

  const isOpen = !isRendered ? false : restProps.isOpen

  const Target = useMemo(() => {
    return children
  }, [])

  return (
    <OverlayContainer isOpen={isOpen} onClose={onClose} backdropStyle={restProps.backdropStyle}>
      <Transition afterLeave={onClosed} show={isOpen}>
        {Target}
      </Transition>
    </OverlayContainer>
  )
}

const OverlayContainer = ({ isOpen, onClose, backdropStyle, children }: OverlayProps) => {
  return (
    <div className="overlay overlay-container" data-closing={attr(!isOpen)}>
      <Transition show={isOpen}>
        <div onClick={onClose} className="overlay-backdrop" style={backdropStyle} />
      </Transition>
      {children}
    </div>
  )
}
