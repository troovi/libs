import { useEffect, useMemo } from 'react'
import { Icon, Option, OptionItem, OptionsList } from '..'
import { faPlus } from '@companix/icons-solid'
import { Spinner } from '../Spinner'

export interface UseOptionsResponse<T> {
  options: Option<T>[]
  isLoading: boolean
}

interface HookControlled<T> {
  useOptions: () => UseOptionsResponse<T>
  defaultOptions?: Option<T>[]
  options?: undefined
}

interface PropsProvided<T> {
  defaultOptions?: undefined
  useOptions?: undefined
  options: Option<T>[]
}

export type OptionsSource<T> = HookControlled<T> | PropsProvided<T>

export type OptionsSourceControl<T> = OptionsSource<T> & {
  onOptionsLoaded?: (options: Option<T>[]) => void
}

export interface SelectAddOption {
  text: string
  closeOnClick?: boolean
  onClick: () => void
}

export interface SelectOptionsPopoverParams {
  minimalOptions?: boolean
  addOption?: SelectAddOption
  emptyText?: string
}

interface InternalListProps<T> extends SelectOptionsPopoverParams {
  options: Option<T>[]
  // internal params
  scrollboxRef?: React.RefObject<HTMLDivElement>
  optionsWrapperRef?: React.RefObject<HTMLDivElement>
  isActive: (value: T) => boolean
  onSelect?: (value: T) => void
  onOpened?: (activeIndex: number) => void
  filterOptions?: (option: Option<T>) => boolean
  disableFiltering?: boolean
}

const useOptionsDefault = <T,>(): UseOptionsResponse<T> => {
  return { isLoading: false, options: [] }
}

const useOptionsControl = <T,>(props: OptionsSourceControl<T>) => {
  const { onOptionsLoaded, useOptions = useOptionsDefault, options } = props
  const data = useOptions()

  useEffect(() => {
    if (data.options.length > 0) {
      onOptionsLoaded?.(data.options)
    }
  }, [data.options])

  if (options) {
    return { options, isLoading: undefined }
  }

  return data
}

export type OptionsPopoverProps<T> = OptionsSourceControl<T> & Omit<InternalListProps<T>, 'options'>

export const OptionsPopover = <T,>(props: OptionsPopoverProps<T>) => {
  const {
    isActive,
    emptyText,
    scrollboxRef,
    optionsWrapperRef,
    addOption,
    onOpened,
    onSelect,
    minimalOptions,
    filterOptions,
    disableFiltering,
    ...controlProps
  } = props

  const { options, isLoading } = useOptionsControl(controlProps)

  const items = useMemo(() => {
    if (filterOptions && !disableFiltering) {
      return options.filter(filterOptions)
    }

    return options
  }, [options, filterOptions, disableFiltering])

  if (isLoading) {
    return (
      <div className="select-popover-loading">
        <Spinner size={24} />
      </div>
    )
  }

  return (
    <SelectOptionsList<T>
      options={items}
      isActive={isActive}
      emptyText={emptyText}
      scrollboxRef={scrollboxRef}
      optionsWrapperRef={optionsWrapperRef}
      minimalOptions={minimalOptions}
      addOption={addOption}
      onOpened={onOpened}
      onSelect={onSelect}
    />
  )
}

export const SelectOptionsList = <T,>(props: InternalListProps<T>) => {
  const {
    isActive,
    onOpened,
    addOption,
    scrollboxRef,
    optionsWrapperRef,
    options,
    onSelect,
    minimalOptions,
    emptyText = 'Ничего не найдено'
  } = props

  useEffect(() => {
    onOpened?.(options.findIndex(({ value }) => isActive(value)))
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
      {options.map(({ title, value, className, icon, disabled, label }, i) => (
        <OptionItem
          key={`select-option-${i}`}
          active={isActive(value)}
          onClick={() => onSelect?.(value)}
          minimal={minimalOptions}
          disabled={disabled}
          className={className}
          title={title}
          label={label}
          icon={icon}
        />
      ))}
    </OptionsList>
  )
}
