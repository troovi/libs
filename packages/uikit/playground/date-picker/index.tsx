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
        <div style={{ width: '340px' }}>
          <DatePickerControl size="md" showNeighboringMonth disablePickers />
        </div>
        <div style={{ width: '340px' }}>
          <DatePickerControl size="md" native />
        </div>
      </div>
    </div>
  )
}

interface Props {
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  native?: boolean
  showNeighboringMonth?: boolean
  disablePickers?: boolean
}

export const DatePickerControl = (props: Props) => {
  const { size, disabled, required, native, showNeighboringMonth, disablePickers } = props
  const [value, onChange] = useState<null | Date>(new Date())

  console.log(value)
  console.log(value?.toISOString())
  console.log('')

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
      native={native}
      showNeighboringMonth={showNeighboringMonth}
      disablePickers={disablePickers}
    />
  )
}
