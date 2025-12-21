import { DateInput } from '@/DateInput'
import { useState } from 'react'

export const DateInputExample = () => {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex items-center gap-40">
        <div style={{ maxWidth: '340px', width: '340px' }}>
          <DateInputControl size="md" />
        </div>
        <div style={{ maxWidth: '340px', width: '340px' }}>
          <DateInputControl size="md" disabled />
        </div>
        <div style={{ maxWidth: '340px', width: '340px' }}>
          <DateInputControl size="md" required />
        </div>
      </div>
      <div className="flex items-center gap-40">
        <div style={{ maxWidth: '340px', width: '340px' }}>
          <DateInputControl size="sm" />
        </div>
        <div style={{ maxWidth: '340px', width: '340px' }}>
          <DateInputControl size="sm" disabled />
        </div>
        <div style={{ maxWidth: '340px', width: '340px' }}>
          <DateInputControl size="sm" required />
        </div>
      </div>
    </div>
  )
}

interface Props {
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
}

const DateInputControl = ({ size, disabled, required }: Props) => {
  const [value, onChange] = useState({ month: 0, year: 0, day: 0 })

  return (
    <DateInput value={value} size={size} onChange={onChange} disabled={disabled} required={required} />
  )
}
