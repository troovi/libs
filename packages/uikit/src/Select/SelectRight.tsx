import { faXmark, faChevronDown } from '@companix/icons-solid'
import { Icon } from '../Icon'

interface SelectRightElementsProps {
  onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
  clearButton?: boolean
  clearButtonIcon?: React.ReactNode
  customElement?: React.ReactNode
  /**
   * Подпись перед крестиком и стрелкой — второстепенным цветом, в размер шрифта поля. Пустая (`null`, `false`,
   * `''`) не выводится и места не занимает.
   */
  aside?: React.ReactNode
  value: boolean
  /** Поле отключено — значение не сбрасывается, крестика нет. */
  disabled?: boolean
}

export const SelectRightElements = (props: SelectRightElementsProps) => {
  const { customElement, aside, clearButton, clearButtonIcon, value, disabled, onClear } = props

  return (
    <>
      {aside !== null && aside !== undefined && aside !== false && aside !== '' && (
        <span className="select-aside">{aside}</span>
      )}
      {customElement}
      {clearButton && value && !disabled && (
        <button type="button" className="select-close-button" onClick={onClear}>
          {clearButtonIcon ?? <Icon className="select-close-icon" icon={faXmark} size="xxxs" />}
        </button>
      )}
      <Icon className="expand-icon select-expand" icon={faChevronDown} size="xxxs" />
    </>
  )
}
