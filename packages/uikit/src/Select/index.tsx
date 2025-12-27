import { useEffect, useMemo } from 'react'
import { OptionsList } from '../OptionItem/OptionsList'
import { OptionItem } from '../OptionItem/OptionItem'
import { Popover } from '../Popover'
import { useFroozeClosing } from '../__hooks/use-frooze-closing'
import type { Option } from '../types'
import { SelectFormProps, SelectInput } from './SelectInput'
import { useScrollListController } from '../__hooks/use-scrollbox'

interface Cleanable<T> {
  clearButton: true
  onChange: (event: T | null) => void
  value: T | null
}

interface UnCleanable<T> {
  clearButton?: false
  onChange: (event: T) => void
  value: T
}

type DependedValueType<T> = Cleanable<T> | UnCleanable<T>

type SelectProps<T> = Omit<SelectFormProps, 'value' | 'onChange' | 'closeButton'> &
  DependedValueType<T> & {
    options: Option<T>[]
    children?: React.ReactNode
    minimalOptions?: boolean
    matchTarget?: 'width' | 'min-width'
  }

export const Select = <T,>(props: SelectProps<T>) => {
  const {
    options,
    onChange,
    value,
    minimalOptions,
    matchTarget = 'width',
    children,
    disabled,
    clearButton,
    ...selectProps
  } = props

  const currentOption = useMemo(() => {
    const index = options.findIndex((o) => o.value === value)

    return {
      index,
      option: options[index] as Option<T> | undefined
    }
  }, [options, value])

  const active = currentOption.option?.value ?? null

  const { popoverRef, froozePopoverPosition, handleAnimationEnd } = useFroozeClosing()
  const { scrollToElement, optionsWrapperRef, scrollBoxRef } = useScrollListController()

  const handleChange = (value: T, close: () => void) => {
    froozePopoverPosition()
    onChange(value)
    close()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (clearButton) {
      onChange(null)
    }
  }

  const onOpened = () => {
    if (currentOption.index !== -1) {
      scrollToElement(currentOption.index, true)
    }
  }

  return (
    <Popover
      minimal
      ref={popoverRef}
      sideOffset={0}
      matchTarget={matchTarget}
      onAnimationEnd={handleAnimationEnd}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      disabled={disabled}
      content={({ close }) => (
        <SelectPopover<T>
          options={options}
          active={active}
          scrollboxRef={scrollBoxRef}
          optionsWrapperRef={optionsWrapperRef}
          minimalOptions={minimalOptions}
          onOpened={onOpened}
          onSelect={(value) => handleChange(value, close)}
        />
      )}
    >
      {children ?? (
        <SelectInput
          {...selectProps}
          disabled={disabled}
          clearButton={clearButton}
          value={currentOption.option?.title ?? ''}
          onClear={handleClear}
        />
      )}
    </Popover>
  )
}

interface SelectPopoverProps<T> {
  scrollboxRef?: React.RefObject<HTMLDivElement>
  optionsWrapperRef?: React.RefObject<HTMLDivElement>
  options: Option<T>[]
  minimalOptions?: boolean
  active?: T | null
  onSelect?: (value: T) => void
  onOpened?: () => void
}

const SelectPopover = <T,>(props: SelectPopoverProps<T>) => {
  const { active, onOpened, scrollboxRef, optionsWrapperRef, options, onSelect, minimalOptions } = props

  useEffect(() => {
    onOpened?.()
  }, [])

  return (
    <OptionsList scrollboxRef={scrollboxRef} optionsWrapperRef={optionsWrapperRef} maxHeight={300}>
      {options.map((option, i) => (
        <OptionItem
          key={`option-item-${option.value}-${i}`}
          active={active === option.value}
          onClick={() => onSelect?.(option.value)}
          minimal={minimalOptions}
          {...option}
        />
      ))}
    </OptionsList>
  )
}
