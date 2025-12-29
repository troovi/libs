import { useId } from 'react'
import * as RadioPrimitive from '@radix-ui/react-radio-group'
import { attr } from '@companix/utils-browser'

export interface RadioOption<T> {
  value: T
  label: React.ReactNode
}

interface RadioGroupProps<T> {
  options: RadioOption<T>[]
  onChange: (event: T) => void
  value: T | null
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md'
}

export const RadioGroup = <T extends string>(props: RadioGroupProps<T>) => {
  const { options, value, onChange, disabled, required, size } = props

  return (
    <RadioPrimitive.Root
      className="radio-group"
      disabled={disabled}
      data-required={attr(required && !value)}
      data-v={value}
      value={value}
      onValueChange={(e) => onChange(e as T)}
    >
      {options.map((option, i) => (
        <Radio
          key={`radio-${option.value}-${i}`}
          {...option}
          size={size}
          disabled={disabled}
          required={required && !value}
        />
      ))}
    </RadioPrimitive.Root>
  )
}

interface RadioProps extends RadioOption<string> {
  size?: 'sm' | 'md'
  disabled?: boolean
  required?: boolean
}

export const Radio = ({ value, label, size = 'md', disabled, required }: RadioProps) => {
  const id = useId()

  return (
    <span
      className="radio"
      data-disabled={attr(disabled)}
      data-size={size}
      data-required={attr(required)}
    >
      <RadioPrimitive.Item className="radio-box" value={value} disabled={disabled} id={id}>
        <RadioPrimitive.Indicator className="radio-mark" />
      </RadioPrimitive.Item>
      <label className="radio-label" htmlFor={id} data-disabled={attr(disabled)}>
        {label}
      </label>
    </span>
  )
}
