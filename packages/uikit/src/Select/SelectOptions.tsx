import { useEffect } from 'react'
import { Icon, Option, OptionItem, OptionsList } from '..'
import { faPlus } from '@companix/icons-solid'

interface SelectPopoverProps<T> {
  scrollboxRef?: React.RefObject<HTMLDivElement>
  optionsWrapperRef?: React.RefObject<HTMLDivElement>
  options: Option<T>[]
  minimalOptions?: boolean
  active?: T | null
  onSelect?: (value: T) => void
  onOpened?: () => void
  close: () => void
  addOption?: {
    text: string
    closeOnClick?: boolean
    onClick: () => void
  }
}

export const SelectOptions = <T,>(props: SelectPopoverProps<T>) => {
  const {
    active,
    onOpened,
    addOption,
    scrollboxRef,
    optionsWrapperRef,
    options,
    onSelect,
    close,
    minimalOptions
  } = props

  useEffect(() => {
    onOpened?.()
  }, [])

  return (
    <OptionsList scrollboxRef={scrollboxRef} optionsWrapperRef={optionsWrapperRef} maxHeight={300}>
      {addOption && (
        <OptionItem
          className="select-add-option"
          icon={<Icon icon={faPlus} />}
          title={addOption.text}
          onClick={() => {
            if (addOption.closeOnClick ?? true) {
              close()
            }

            addOption.onClick()
          }}
        />
      )}
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
