import * as SwitchPrimitive from '@radix-ui/react-switch'
import { attr } from '@troovi/utils-browser'
import { useId } from 'react'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
  checkedIcon?: React.ReactNode
  uncheckedIcon?: React.ReactNode
}

const Switch = (props: SwitchProps) => {
  const { checked, disabled, onCheckedChange, uncheckedIcon, checkedIcon, label } = props
  const id = useId()

  return (
    <div className="switch" data-disabled={attr(disabled)}>
      <SwitchPrimitive.Root
        className="switch-track"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        id={id}
      >
        <SwitchPrimitive.Thumb className="switch-thumb">
          {uncheckedIcon && (
            <span className="switch-thumb-icon" data-visible={attr(!checked)}>
              {uncheckedIcon}
            </span>
          )}
          {checkedIcon && (
            <span className="switch-thumb-icon" data-visible={attr(checked)}>
              {checkedIcon}
            </span>
          )}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {label && (
        <label className="switch-label" htmlFor={id} data-disabled={disabled}>
          {label}
        </label>
      )}
    </div>
  )
}

export { Switch }
