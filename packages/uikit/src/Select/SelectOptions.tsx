import { useEffect } from 'react'
import { Icon, Option, OptionItem, OptionsList } from '..'
import { faPlus } from '@companix/icons-solid'

export interface SelectAddOption {
  text: string
  closeOnClick?: boolean
  onClick: () => void
}

interface SelectPopoverProps<T> {
  scrollboxRef?: React.RefObject<HTMLDivElement>
  optionsWrapperRef?: React.RefObject<HTMLDivElement>
  options: Option<T>[]
  minimalOptions?: boolean
  isActive: (value: T) => boolean
  onSelect?: (value: T) => void
  onOpened?: () => void
  addOption?: SelectAddOption
  emptyText?: string
}

export const SelectOptionsList = <T,>(props: SelectPopoverProps<T>) => {
  const {
    isActive,
    onOpened,
    addOption,
    scrollboxRef,
    optionsWrapperRef,
    options,
    onSelect,
    minimalOptions,
    emptyText
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
          onClick={addOption.onClick}
        />
      )}
      {options.length === 0 && !addOption && <div className="select-tags-empty">{emptyText}</div>}
      {options.map((option, i) => (
        <OptionItem
          key={`select-option-${i}`}
          active={isActive(option.value)}
          onClick={() => onSelect?.(option.value)}
          minimal={minimalOptions}
          {...option}
        />
      ))}
    </OptionsList>
  )
}
