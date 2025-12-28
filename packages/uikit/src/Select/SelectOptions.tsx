import { useEffect } from 'react'
import { Option, OptionItem, OptionsList } from '..'

interface SelectPopoverProps<T> {
  scrollboxRef?: React.RefObject<HTMLDivElement>
  optionsWrapperRef?: React.RefObject<HTMLDivElement>
  options: Option<T>[]
  minimalOptions?: boolean
  active?: T | null
  onSelect?: (value: T) => void
  onOpened?: () => void
}

export const SelectOptions = <T,>(props: SelectPopoverProps<T>) => {
  const { active, onOpened, scrollboxRef, optionsWrapperRef, options, onSelect, minimalOptions } = props

  useEffect(() => {
    onOpened?.()
  }, [])

  return (
    <OptionsList scrollboxRef={scrollboxRef} optionsWrapperRef={optionsWrapperRef} maxHeight={300}>
      {options.map((option, i) => (
        <OptionItem
          key={`select-option-${i}`}
          active={active === option.value}
          onClick={() => onSelect?.(option.value)}
          minimal={minimalOptions}
          {...option}
        />
      ))}
    </OptionsList>
  )
}
