import './Popup.scss'
import cn from 'classnames'
import { Overlay, OverlayProps } from '../Overlay'
import { Cross } from '@blueprintjs/icons'
import { box } from '@troovi/utils-browser'
import { Scrollable } from '../Scrollable'

interface PopupProps extends OverlayProps {
  children: React.ReactNode
  className?: string
}

export const Popup = ({ children, className, ...overlayProps }: PopupProps) => {
  return (
    <Overlay {...overlayProps}>
      <div className="popup-container overlay-content" tabIndex={0}>
        <div className={cn('popup', className)}>{children}</div>
      </div>
    </Overlay>
  )
}

Popup.Header = ({ title, close }: { title: React.ReactNode; close: () => void }) => {
  return (
    <div className="popup-header flex items-center justify-between">
      <div className="text-lg font-semibold">{title}</div>
      <div className="close-button center" onClick={close} style={box(28)}>
        <Cross size={20} />
      </div>
    </div>
  )
}

Popup.Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="popup-footer ">{children}</div>
}

Popup.ScrollContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Scrollable implementation="inner" scrollY padding={16} thumbPadding={6} thumbColor="#ffffff26">
      {children}
    </Scrollable>
  )
}
