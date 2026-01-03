import { DatePicker } from '@/DatePicker'
import { Icon } from '@/Icon'
import { faCalendar } from '@companix/icons-solid'
import { useState } from 'react'

export const DatePickerExample = () => {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex items-center gap-40">
        <div style={{ width: '340px' }}>
          <DatePickerControl size="md" />
        </div>
      </div>
    </div>
  )
}

interface Props {
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
}

export const DatePickerControl = ({ size, disabled, required }: Props) => {
  const [value, onChange] = useState<null | Date>(new Date())

  return (
    <DatePicker
      fill
      clearButton
      leftElement={<Icon icon={faCalendar} size="xxs" className="form-space-margin" />}
      value={value}
      size={size}
      onChange={onChange}
      disabled={disabled}
      required={required}
      placeholder="Укажите дату"
      disableFuture
    />
  )
}
