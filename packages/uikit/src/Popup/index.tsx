import './Popup.scss'
import cn from 'classnames'
import { Overlay, OverlayProps } from '../Overlay'

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
