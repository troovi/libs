import './Drawer.scss'
import cn from 'classnames'
import { Overlay, OverlayProps } from '../Overlay'

interface DrawerOptions extends OverlayProps {
  size: string
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

export const Drawer = ({ children, size, style, className, ...overlayProps }: DrawerOptions) => {
  return (
    <Overlay {...overlayProps}>
      <div
        style={{ width: size, ...style }}
        className={cn('drawer drawer-right overlay-content', className)}
      >
        {children}
      </div>
    </Overlay>
  )
}
