import React from 'react'

interface DrawerContextValue {
  drawerRef: React.RefObject<HTMLDivElement>
  overlayRef: React.RefObject<HTMLDivElement>
  onPress: (event: React.PointerEvent<HTMLDivElement>) => void
  onRelease: (event: React.PointerEvent<HTMLDivElement> | null) => void
  onDrag: (event: React.PointerEvent<HTMLDivElement>) => void
  isOpen: boolean
  isDragging: boolean
  keyboardIsOpen: React.MutableRefObject<boolean>
  closeDrawer: () => void
  shouldAnimate: React.MutableRefObject<boolean>
  onClosed?: () => void
  disableEsc?: boolean
}

export const DrawerContext = React.createContext<DrawerContextValue>({
  drawerRef: { current: null },
  overlayRef: { current: null },
  onPress: () => {},
  onRelease: () => {},
  onDrag: () => {},
  isOpen: false,
  isDragging: false,
  keyboardIsOpen: { current: false },
  closeDrawer: () => {},
  shouldAnimate: { current: true }
})

export const useDrawerContext = () => {
  const context = React.useContext(DrawerContext)
  if (!context) {
    throw new Error('useDrawerContext must be used within a MobileDrawer.Root')
  }
  return context
}
