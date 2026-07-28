import { useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Popover } from '../Popover'
import { useFroozeClosing } from '../__hooks/use-frooze-closing'
import { SelectFormProps, SelectInput } from './SelectInput'
import { useScrollListController } from '../__hooks/use-scrollbox'
import { OptionsSource, OptionsPopover, SelectOptionsPopoverParams } from './OptionsPopover'
import { mergeRefs } from 'react-merge-refs'
import type { Option } from '../types'

interface Cleanable<T> {
  clearButton: true
  onChange: (value: T | null) => void
}

interface UnCleanable<T> {
  clearButton?: false
  onChange: (value: T) => void
}

type OnChangeValueType<T> = Cleanable<T> | UnCleanable<T>

export interface SelectParams extends SelectOptionsPopoverParams {
  matchTarget?: 'width' | 'min-width'
  popoverRef?: React.Ref<HTMLDivElement>
  scrollRef?: React.Ref<{ scrollTo: (index: number) => void }>
}

export interface SelectTriggerParams<T> {
  /** Опция текущего значения, null — если значение не выбрано или опция ещё не загружена */
  option: Option<T> | null
  /** Заголовок текущей опции, пустая строка — если значение не выбрано */
  title: string
  /** Открыт ли список опций */
  isOpen: boolean
  /** Сброс значения. Работает только вместе с clearButton */
  clear: (event: React.MouseEvent) => void
}

/**
 * Кастомный триггер селекта. Должен вернуть один элемент,
 * принимающий ref и обработчики (Popover рендерит его через asChild)
 */
export type SelectTrigger<T> = (params: SelectTriggerParams<T>) => React.ReactNode

export type SelectProps<T> = OptionsSource<T> &
  Omit<SelectFormProps, 'value'> &
  SelectParams &
  OnChangeValueType<T> & {
    value: T | null
    children?: React.ReactNode | SelectTrigger<T>
  }

export const Select = <T,>(props: SelectProps<T>) => {
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

  const optionsStore = useRef({} as Record<symbol, Option<T>>)
  const [isOpen, setIsOpen] = useState(false)

  const isCustomTrigger = typeof children === 'function'

  // startup store
  useMemo(() => {
    const startupOptions = props.options ?? props.defaultOptions ?? []

    startupOptions.forEach((option) => {
      optionsStore.current[option.value as symbol] = option
    })
  }, [props.options, props.defaultOptions])

  const activeOption: Option<T> | null =
    value === null ? null : optionsStore.current[value as symbol] ?? null

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
      // состояние открытия нужно только кастомному триггеру, иначе не перерисовываем селект
      onOpenChange={isCustomTrigger ? setIsOpen : undefined}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      disabled={disabled}
      content={({ close }) => (
        <OptionsPopover<T>
          {...optionPopoverProps}
          close={close}
          isActive={(optionValue) => optionValue === value}
          onSelect={(value) => handleChange(value, close)}
          scrollboxRef={scrollBoxRef}
          optionsWrapperRef={optionsWrapperRef}
          onOpened={(activeIndex) => scrollToElement(activeIndex, 'center')}
          onOptionsLoaded={(newOptions) => {
            newOptions.forEach((option) => {
              optionsStore.current[option.value as symbol] = option
            })
          }}
        />
      )}
    >
      {isCustomTrigger
        ? children({
            option: activeOption,
            title: activeOption?.title ?? '',
            isOpen,
            clear: handleClear
          })
        : children ?? (
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
              customElement={activeOption?.indicator}
              clearButtonIcon={clearButtonIcon}
              value={activeOption?.title ?? ''}
            />
          )}
    </Popover>
  )
}
