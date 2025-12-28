import { faChevronDown, faClose } from '@fortawesome/free-solid-svg-icons'
import { Icon } from '../Icon'

interface SelectRightElementsProps {
  onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
  clearButton?: boolean
  clearButtonIcon?: React.ReactNode
  value: boolean
}

export const SelectRightElements = (props: SelectRightElementsProps) => {
  const { clearButton, clearButtonIcon, value, onClear } = props

  return (
    <>
      {clearButton && value && (
        <button className="select-close-button" onClick={onClear}>
          {clearButtonIcon ?? <Icon className="select-close-icon" icon={faClose} size="xxxs" />}
        </button>
      )}
      <Icon className="expand-icon select-expand" icon={faChevronDown} size="xxxs" />
    </>
  )
}
