import cn from 'classnames'
import { Spinner } from '../Spinner'
import { Icon, IconDefinition } from '../Icon'
import { attr } from '@companix/utils-browser'
import { WriteBarInput } from './Input'
import { Editor } from './Editor'

export interface WriteBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onFocus' | 'onBlur' | 'onKeyDown'> {
  containerRef?: React.Ref<HTMLDivElement>
  /**
   * Содержимое, отображаемое слева от поля ввода.
   */
  before?: React.ReactNode
  /**
   * Содержимое, отображаемое справа от поля ввода.
   */
  after?: React.ReactNode
  /**
   * Добавляет тень вокруг поля ввода.
   */
  contentClassName?: string
  shadow?: boolean
  header?: React.ReactNode
  children?: never
  placeholder?: string
  onCreate: (editor: Editor) => void
}

export const WriteBar = (props: WriteBarProps) => {
  const {
    before,
    after,
    containerRef,
    header,
    contentClassName,
    placeholder,
    id,
    onCreate,
    className,
    ...restProps
  } = props

  return (
    <div ref={containerRef} {...restProps} className={cn('write-bar', className)}>
      {header}
      <div className={cn('write-bar-content', contentClassName)}>
        {before && <div className="write-bar-before">{before}</div>}
        <WriteBarInput
          className="write-bar-input-wrapper"
          placeholder={placeholder}
          placeholderClassName="write-bar-placeholder"
          inputClassName="write-bar-input"
          inputMode="text"
          id={id}
          onCreate={onCreate}
        />
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
