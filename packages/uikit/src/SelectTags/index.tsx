import { useFroozeClosing } from '../__hooks/use-frooze-closing'
import type { Option } from '../types'
import { Popover } from '../Popover'
import { useMemo, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { attr, contains, getActiveElementByAnotherElement } from '@companix/utils-browser'
import { mergeRefs } from 'react-merge-refs'
import { faXmark, faChevronDown } from '@companix/icons-solid'
import { matchPattern } from '@companix/utils-js'
import { SelectAddOption, SelectOptionsList } from '../Select/SelectOptions'
import { SelectLoader } from '../Select/SelectLoader'

export interface SelectTagsProps<T> {
  options: Option<T>[]
  onChange: (event: T[]) => void
  placeholder?: string
  value: T[]
  children?: React.ReactNode
  disabled?: boolean
  readOnly?: boolean
  closeAfterSelect?: boolean
  emptyText?: string
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  minimalOptions?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  required?: boolean
  isLoading?: boolean
  addOption?: SelectAddOption
}

export const SelectTags = <T extends string | number>(props: SelectTagsProps<T>) => {
  const {
    options: optionsProp,
    closeAfterSelect,
    placeholder,
    onChange,
    emptyText,
    readOnly,
    size = 'md',
    value: values,
    inputRef: propInputRef,
    minimalOptions,
    isLoading,
    disabled,
    required,
    addOption
  } = props

  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const { popoverRef, froozePopoverPosition, handleAnimationEnd } = useFroozeClosing()

  const store = useMemo(() => {
    const store = {} as { [value in T]: Option<T> }

    optionsProp.forEach((option) => {
      store[option.value] = option
    })

    return store
  }, [optionsProp])

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

  const options = useMemo(() => {
    if (!inputValue.trim()) {
      return optionsProp
    }

    return optionsProp.filter(({ title }) => {
      return matchPattern(title, inputValue)
    })
  }, [inputValue, optionsProp])

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

  // const

  return (
    <Popover
      minimal
      ref={popoverRef}
      sideOffset={0}
      matchTarget="width"
      onAnimationEnd={handleAnimationEnd}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      content={({ close }) => {
        if (isLoading) {
          return <SelectLoader />
        }

        return (
          <SelectOptionsList
            isActive={(value) => values.includes(value)}
            options={options}
            emptyText={emptyText}
            onSelect={(value) => handleSelect(add(value), close)}
            minimalOptions={minimalOptions}
            addOption={addOption}
          />
        )
      }}
    >
      <div
        className="form"
        onClick={handleRootClick}
        onMouseDown={handleRootMouseDown}
        data-size={size}
        data-required={attr(required)}
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
                {values.map((value, i) => (
                  <div key={`tag-option-${value}-${i}`} className="tag">
                    <span className="tag-name">{store[value].title}</span>
                    <button className="tag-close-button" onClick={(e) => handleRemove(e, value)}>
                      <Icon className="tag-close-icon" icon={faXmark} size="xxxs" />
                    </button>
                  </div>
                ))}
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
                onChange={({ target }) => setInputValue(target.value)}
              />
            )}
          </div>
          <Icon className="expand-icon" icon={faChevronDown} size="xxxs" />
        </div>
      </div>
    </Popover>
  )
}
