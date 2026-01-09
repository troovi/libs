import { useImperativeHandle, useMemo } from 'react'
import { Popover } from '../Popover'
import { useFroozeClosing } from '../__hooks/use-frooze-closing'
import { SelectFormProps, SelectInput } from './SelectInput'
import { useScrollListController } from '../__hooks/use-scrollbox'
import { OptionsSource, SelectAddOption, OptionsPopover } from './OptionsPopover'
import { mergeRefs } from 'react-merge-refs'
import type { Option } from '../types'

interface Cleanable<T> {
  clearButton: true
  onChange: (event: T | null) => void
}

interface UnCleanable<T> {
  clearButton?: false
  onChange: (event: T) => void
}

type DependedValueType<T> = Cleanable<T> | UnCleanable<T>

export interface SelectParams {
  matchTarget?: 'width' | 'min-width'
  popoverRef?: React.Ref<HTMLDivElement>
  scrollRef?: React.Ref<{ scrollTo: (index: number) => void }>
  // options list
  emptyText?: string
  minimalOptions?: boolean
  addOption?: SelectAddOption
}

export type SelectProps<T> = Omit<SelectFormProps, 'value' | 'onChange' | 'closeButton'> &
  DependedValueType<T> &
  SelectParams &
  OptionsSource<T> & {
    value: T | null
    children?: React.ReactNode
  }

export const Select = <T extends string | number>(props: SelectProps<T>) => {
  const {
    onChange,
    value,
    matchTarget = 'width',
    children,
    scrollRef,
    popoverRef: propPopoverRef,
    clearButton,
    // select props
    disabled,
    required,
    className,
    clearButtonIcon,
    leftElement,
    inputRef,
    onClear,
    fill,
    size,
    placeholder,
    onClick,
    // options popover
    ...optionPopoverProps
  } = props

  // store
  const optionsStore = useMemo(() => {
    const store = {} as { [value in T]: Option<T> }
    const startupOptions = props.options ?? props.defaultOptions ?? []

    startupOptions.forEach((option) => {
      store[option.value] = option
    })

    return store
  }, [props.options, props.defaultOptions])

  const activeOption: Option<T> | null = value === null ? null : optionsStore[value] ?? null

  const { popoverRef, froozePopoverPosition, handleAnimationEnd } = useFroozeClosing()
  const { scrollToElement, optionsWrapperRef, scrollBoxRef } = useScrollListController()

  useImperativeHandle(scrollRef, () => {
    return {
      scrollTo: (index) => scrollToElement(index, 'top')
    }
  })

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

  return (
    <Popover
      minimal
      ref={mergeRefs([popoverRef, propPopoverRef])}
      sideOffset={0}
      matchTarget={matchTarget}
      onAnimationEnd={handleAnimationEnd}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      disabled={disabled}
      content={({ close }) => (
        <OptionsPopover<T>
          {...optionPopoverProps}
          isActive={(optionValue) => optionValue === value}
          onSelect={(value) => handleChange(value, close)}
          scrollboxRef={scrollBoxRef}
          optionsWrapperRef={optionsWrapperRef}
          onOpened={(activeIndex) => scrollToElement(activeIndex, 'center')}
          onOptionsLoaded={(newOptions) => {
            newOptions.forEach((option) => {
              optionsStore[option.value] = option
            })
          }}
        />
      )}
    >
      {children ?? (
        <SelectInput
          required={required}
          className={className}
          leftElement={leftElement}
          inputRef={inputRef}
          onClear={handleClear}
          fill={fill}
          size={size}
          placeholder={placeholder}
          onClick={onClick}
          disabled={disabled}
          clearButton={clearButton}
          clearButtonIcon={clearButtonIcon}
          value={activeOption?.title ?? ''}
        />
      )}
    </Popover>
  )
}
