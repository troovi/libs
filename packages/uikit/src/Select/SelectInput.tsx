import cn from 'classnames'

import { attr } from '@companix/utils-browser'
import { forwardRef, useCallback, useRef } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { mergeRefs } from 'react-merge-refs'
import { SelectRightElements } from './SelectRight'

export interface SelectFormProps extends React.HTMLAttributes<HTMLDivElement> {
  required?: boolean
  disabled?: boolean
  className?: string
  leftElement?: React.ReactNode
  placeholder?: string
  value?: string | number
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  clearButton?: boolean
  clearButtonIcon?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const SelectInput = forwardRef<HTMLDivElement, SelectFormProps>(
  (
    {
      required,
      size,
      fill,
      leftElement,
      className,
      value,
      clearButton,
      placeholder,
      clearButtonIcon,
      disabled,
      onClear,
      inputRef,
      ...containerProps
    },
    ref
  ) => {
    const selectInputRef = useRef<HTMLInputElement>(null)

    // https://vkui.io/components/custom-select/
    const passClickAndFocusToInputOnClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectInputRef.current || !document) {
          return
        }

        const clickTargetIsNotAnInput = e.target !== selectInputRef.current
        if (clickTargetIsNotAnInput) {
          selectInputRef.current.click()

          const inputIsNotFocused = document.activeElement !== selectInputRef.current
          if (inputIsNotFocused) {
            selectInputRef.current.focus()
          }
        }
      },
      [selectInputRef]
    )

    const preventInputBlurWhenClickInsideFocusedSelectArea = (e: React.MouseEvent<HTMLDivElement>) => {
      // Так как инпут больше не оборачивается пустым лэйблом, то клик внутри обертки,
      // но вне инпута (например по иконке дропдауна), будет убирать фокус с инпута.
      // Чтобы в такой ситуации отключить blur инпута мы превентим mousedown событие обёртки
      const isInputFocused = document && document.activeElement === selectInputRef.current
      if (isInputFocused) {
        e.preventDefault()
      }
    }

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      passClickAndFocusToInputOnClick(event)
    }

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      preventInputBlurWhenClickInsideFocusedSelectArea(event)
    }

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      selectInputRef.current && selectInputRef.current.focus()
      onClear?.(event)
    }

    return (
      <div
        ref={ref}
        className={cn('form select', className)}
        data-size={size ?? 'md'}
        data-fill={attr(fill)}
        data-required={attr(required)}
        data-disabled={attr(disabled)}
        onMouseDown={onMouseDown}
        {...containerProps}
        onClick={onClick}
      >
        <div className="select-layout form-input">
          {leftElement && <div className="select-element">{leftElement}</div>}
          <div className="select-content">
            <div className="select-content-text" aria-disabled={disabled}>
              {!value && <span className="select-placeholder">{placeholder}</span>}
              {value}
            </div>
          </div>
          <div className="select-element">
            <SelectRightElements
              clearButton={clearButton}
              value={Boolean(value)}
              clearButtonIcon={clearButtonIcon}
              onClear={handleClear}
            />
          </div>
        </div>
        <VisuallyHidden asChild>
          <input
            ref={mergeRefs([inputRef, selectInputRef])}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            aria-autocomplete="none"
            onClick={containerProps.onClick}
            readOnly
          />
        </VisuallyHidden>
      </div>
    )
  }
)
