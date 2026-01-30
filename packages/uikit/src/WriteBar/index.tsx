import cn from 'classnames'
import { Spinner } from '..'
import { Icon, IconDefinition } from '../Icon'
import { useResizeTextarea } from '../__hooks/use-resize'
import { attr, callMultiple } from '@companix/utils-browser'
import { mergeRefs } from 'react-merge-refs'
import { useEffect } from 'react'

export interface WriteBarProps
  extends Pick<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      | 'onKeyDown'
      | 'autoComplete'
      | 'cols'
      | 'dirName'
      | 'disabled'
      | 'maxLength'
      | 'minLength'
      | 'name'
      | 'placeholder'
      | 'readOnly'
      | 'required'
      | 'rows'
      | 'value'
      | 'wrap'
      | 'onChange'
      | 'onFocus'
      | 'onBlur'
    >,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onFocus' | 'onBlur' | 'onKeyDown'> {
  containerRef?: React.Ref<HTMLDivElement>
  textareaRef?: React.Ref<HTMLTextAreaElement>
  /**
   * Содержимое, отображаемое слева от поля ввода.
   */
  before?: React.ReactNode
  /**
   * Содержимое, отображаемое поверх поля ввода (актуально для iOS).
   */
  inlineAfter?: React.ReactNode
  /**
   * Содержимое, отображаемое справа от поля ввода.
   */
  after?: React.ReactNode
  /**
   * Вызывается при смене высоты поля ввода.
   */
  onHeightChange?: VoidFunction
  /**
   * Добавляет тень вокруг поля ввода.
   */
  contentClassName?: string
  shadow?: boolean
  attachbar?: React.ReactNode
  children?: never
}

export const WriteBar = ({
  // WriteBarProps
  before,
  inlineAfter,
  after,
  onHeightChange,
  shadow = false,
  containerRef,
  attachbar,
  contentClassName,

  // textarea props
  textareaRef,
  autoComplete,
  cols,
  dirName,
  disabled,
  maxLength,
  minLength,
  name,
  placeholder,
  readOnly,
  required,
  value,
  wrap,
  rows,
  onChange,
  onFocus,
  onBlur,
  id,
  inputMode,
  defaultValue,
  autoFocus,
  tabIndex,
  spellCheck,
  className,
  onKeyDown,
  ...restProps
}: WriteBarProps) => {
  const [refResizeTextarea, resize] = useResizeTextarea(onHeightChange, true)

  useEffect(resize, [resize, value])

  return (
    <div ref={containerRef} {...restProps} className={cn('write-bar', className)}>
      {attachbar}
      <div className={cn('write-bar-content', contentClassName)}>
        {before && <div className="write-bar-before">{before}</div>}
        <div className="write-bar-form">
          <textarea
            ref={mergeRefs([textareaRef, refResizeTextarea])}
            {...{
              id,
              onChange: callMultiple(onChange, resize),
              autoComplete,
              cols,
              disabled,
              maxLength,
              minLength,
              name,
              placeholder,
              readOnly,
              required,
              value,
              wrap,
              rows,
              onFocus,
              onBlur,
              inputMode,
              defaultValue,
              autoFocus,
              tabIndex,
              spellCheck,
              onKeyDown
            }}
          />
        </div>
        {after && <div className="write-bar-after">{after}</div>}
      </div>
    </div>
  )
}

interface WriteBarIconProps {
  icon: IconDefinition
  onClick?: () => void
  mode: 'send' | 'attach'
  isLoading?: boolean
  isHidden?: boolean
  Component?: React.ElementType
}

WriteBar.IconButton = ({
  Component = 'button',
  icon,
  mode,
  onClick,
  isLoading,
  isHidden
}: WriteBarIconProps) => {
  return (
    <Component
      onClick={onClick}
      className="write-bar-icon"
      data-mode={mode}
      data-hidden={attr(isHidden)}
    >
      {isLoading ? <Spinner size={18} /> : <Icon icon={icon} size="xxs" />}
    </Component>
  )
}
