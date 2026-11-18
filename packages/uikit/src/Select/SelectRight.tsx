import { faXmark, faChevronDown } from '@companix/icons-solid'
import { Icon } from '../Icon'

interface SelectRightElementsProps {
  onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
  clearButton?: boolean
  clearButtonIcon?: React.ReactNode
  customElement?: React.ReactNode
  value: boolean
  /** Поле отключено — значение не сбрасывается, крестика нет. */
  disabled?: boolean
}

export const SelectRightElements = (props: SelectRightElementsProps) => {
  const { customElement, clearButton, clearButtonIcon, value, disabled, onClear } = props

  return (
    <>
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
