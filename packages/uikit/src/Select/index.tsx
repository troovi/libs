import { useImperativeHandle, useMemo } from 'react'
import { Popover } from '../Popover'
import { useFroozeClosing } from '../__hooks/use-frooze-closing'
import type { Option } from '../types'
import { SelectFormProps, SelectInput } from './SelectInput'
import { useScrollListController } from '../__hooks/use-scrollbox'
import { SelectOptions } from './SelectOptions'
import { mergeRefs } from 'react-merge-refs'

interface Cleanable<T> {
  clearButton: true
  onChange: (event: T | null) => void
}

interface UnCleanable<T> {
  clearButton?: false
  onChange: (event: T) => void
}

type DependedValueType<T> = Cleanable<T> | UnCleanable<T>

export type SelectProps<T> = Omit<SelectFormProps, 'value' | 'onChange' | 'closeButton'> &
  DependedValueType<T> & {
    value: T | null
    options: Option<T>[]
    children?: React.ReactNode
    minimalOptions?: boolean
    matchTarget?: 'width' | 'min-width'
    popoverRef?: React.Ref<HTMLDivElement>
    scrollRef?: React.Ref<{ scrollTo: (index: number) => void }>
    addOption?: {
      text: string
      onClick: () => void
    }
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
    scrollRef,
    popoverRef: propPopoverRef,
    clearButton,
    addOption,
    ...selectProps
  } = props

  const currentOption = useMemo(() => {
    const index = value === null ? -1 : options.findIndex((o) => o.value === value)

    return {
      index,
      option: options[index] as Option<T> | undefined
    }
  }, [options, value])

  const active = currentOption.option?.value ?? null

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

  const handleClose = (close: () => void) => {
    froozePopoverPosition()
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
      scrollToElement(currentOption.index, 'center')
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
        <SelectOptions<T>
          options={options}
          active={active}
          scrollboxRef={scrollBoxRef}
          optionsWrapperRef={optionsWrapperRef}
          minimalOptions={minimalOptions}
          close={() => handleClose(close)}
          addOption={addOption}
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
