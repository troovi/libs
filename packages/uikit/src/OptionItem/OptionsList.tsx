import './index.scss'

import { height } from '@troovi/utils-browser'
import { Scrollable } from '../Scrollable'

interface MenuProps {
  children: React.ReactNode
  maxHeight?: number
}

export const OptionsList = ({ children, maxHeight }: MenuProps) => {
  return (
    <Scrollable
      implementation="inner"
      padding={10}
      thumbPadding={3}
      thumbColor="#ffffff2b"
      maxHeight={maxHeight}
      scrollY
    >
      <div style={height(10)} />
      {children}
      <div style={height(10)} />
    </Scrollable>
  )
}
