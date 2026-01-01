import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Icon } from '../Icon'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { useId } from 'react'
import { attr } from '@companix/utils-browser'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  size?: 'sm' | 'md'
  label?: React.ReactNode
  disabled?: boolean
  required?: boolean
}

const Checkbox = ({ checked, required, disabled, onCheckedChange, size, label }: CheckboxProps) => {
  const id = useId()

  return (
    <div
      className="checkbox"
      data-size={size ?? 'md'}
      data-required={attr(required && !checked)}
      data-disabled={attr(disabled)}
    >
      <CheckboxPrimitive.Root
        className="checkbox-box"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        id={id}
      >
        <CheckboxPrimitive.Indicator className="checkbox-icon">
          <Icon icon={faCheck} size="xxxs" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label className="checkbox-label" htmlFor={id} data-disabled={attr(disabled)}>
          {label}
        </label>
      )}
    </div>
  )
}

export { Checkbox }
