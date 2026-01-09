import { useFroozeClosing } from '../__hooks/use-frooze-closing'
import type { Option } from '../types'
import { Popover } from '../Popover'
import { useMemo, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { attr, contains, getActiveElementByAnotherElement } from '@companix/utils-browser'
import { mergeRefs } from 'react-merge-refs'
import { faXmark, faChevronDown } from '@companix/icons-solid'
import { OptionsSource, OptionsPopover, SelectOptionsPopoverParams } from '../Select/OptionsPopover'
import { matchPattern } from '@companix/utils-js'

export interface SelectTagsParams<T> extends SelectOptionsPopoverParams {
  closeAfterSelect?: boolean
  onInputChange?: (text: string) => void
  onChange: (event: T[]) => void
  value: T[]
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  required?: boolean
}

export type SelectTagsProps<T> = OptionsSource<T> & SelectTagsParams<T>

export const SelectTags = <T extends string | number>(props: SelectTagsProps<T>) => {
  const {
    closeAfterSelect,
    placeholder,
    onChange,
    onInputChange,
    readOnly,
    size = 'md',
    fill,
    value: values,
    inputRef: propInputRef,
    disabled,
    required,
    // options popover
    ...optionsPopoverProps
  } = props

  const [inputValue, setInputValue] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  const { popoverRef, froozePopoverPosition, handleAnimationEnd } = useFroozeClosing()

  const add = (value: T) => {
    if (values.includes(value)) {
      return [...values]
    }

    return [...values, value]
  }

  const remove = (value: T) => {
    return values.filter((item) => value !== item)
  }

  const handleSelect = (value: T[], close: () => void) => {
    if (closeAfterSelect) {
      froozePopoverPosition()
      onChange(value)
      close()
    } else {
      onChange(value)
    }
  }

  const handleRootClick = (event: React.MouseEvent) => {
    if (disabled) return

    // Предотвращаем закрытие Popover при клике на форму
    if (popoverRef.current && popoverRef.current.getAttribute('data-state') === 'open') {
      event.preventDefault()
    }

    const activeElement = getActiveElementByAnotherElement(event.currentTarget)

    if (event.defaultPrevented || contains(event.currentTarget, activeElement)) {
      return
    }

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleRootMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Когда клик в сам инпут, не нужно делать preventDefault, так как не будет работать выделение текста
    if (e.target === inputRef.current) {
      return
    }
    // Делаем preventDefault
    e.preventDefault()
  }

  const handleRemove = (e: React.MouseEvent, value: T) => {
    e.stopPropagation()
    onChange(remove(value))
  }

  const handleInputChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(target.value)
    onInputChange?.(target.value)
  }

  // store
  const optionsStore = useMemo(() => {
    const store = {} as { [value in T]: Option<T> }
    const startupOptions = props.options ?? props.defaultOptions ?? []

    startupOptions.forEach((option) => {
      store[option.value] = option
    })

    return store
  }, [props.options, props.defaultOptions])

  return (
    <Popover
      minimal
      ref={popoverRef}
      sideOffset={0}
      matchTarget="width"
      onAnimationEnd={handleAnimationEnd}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      content={({ close }) => (
        <OptionsPopover<T>
          {...optionsPopoverProps}
          isActive={(value) => values.includes(value)}
          onSelect={(value) => handleSelect(add(value), close)}
          disableFiltering={!inputValue.trim()}
          filterOptions={({ title }) => matchPattern(title, inputValue)}
          onOptionsLoaded={(newOptions) => {
            newOptions.forEach((option) => {
              optionsStore[option.value] = option
            })
          }}
        />
      )}
    >
      <div
        className="form"
        onClick={handleRootClick}
        onMouseDown={handleRootMouseDown}
        data-size={size ?? 'md'}
        data-fill={attr(fill)}
        data-required={attr(required)}
        data-disabled={attr(disabled)}
      >
        <div className="select-tags-container">
          <div className="select-tags">
            {values.length > 0 && (
              <div
                className="tag-container"
                ref={listboxRef}
                role="listbox"
                data-readonly={attr(readOnly)}
              >
                {values.map((value, i) => {
                  if (!optionsStore[value]) return null

                  return (
                    <div key={`tag-option-${value}-${i}`} className="tag">
                      <span className="tag-name">{optionsStore[value].title}</span>
                      <button className="tag-close-button" onClick={(e) => handleRemove(e, value)}>
                        <Icon className="tag-close-icon" icon={faXmark} size="xxxs" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {(!readOnly || values.length === 0) && (
              <input
                ref={mergeRefs([propInputRef, inputRef])}
                type="text"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                className="form-input"
                spellCheck={false}
                value={inputValue}
                disabled={disabled}
                readOnly={readOnly}
                placeholder={placeholder}
                onChange={handleInputChange}
              />
            )}
          </div>
          <Icon className="expand-icon" icon={faChevronDown} size="xxxs" />
        </div>
      </div>
    </Popover>
  )
}
