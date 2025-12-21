import { Scrollable } from '../Scrollable'

interface MenuProps {
  children: React.ReactNode
  maxHeight?: number
  scrollboxRef?: React.Ref<HTMLDivElement>
  optionsWrapperRef?: React.Ref<HTMLDivElement>
}

export const OptionsList = ({ children, maxHeight, scrollboxRef, optionsWrapperRef }: MenuProps) => {
  return (
    <Scrollable
      ref={scrollboxRef}
      implementation="inner"
      padding={10}
      thumbPadding={3}
      thumbColor="#0000002b"
      maxHeight={maxHeight}
      scrollY
    >
      <div className="option-list" ref={optionsWrapperRef}>
        {children}
      </div>
    </Scrollable>
  )
}
