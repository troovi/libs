import { RadioGroup } from '@/Radio'
import { useState } from 'react'

export const RadioGroupExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-24">
        <RadioGroupControl
          size="md"
          options={[
            { value: 'soup', label: 'Soup with tomatos' },
            { value: 'salat', label: 'Salat olivie' },
            { value: 'sandwich', label: 'Sandwich S7 Airlines' }
          ]}
        />
        <RadioGroupControl
          size="sm"
          options={[
            { value: 'soup', label: 'Soup with tomatos' },
            { value: 'salat', label: 'Salat olivie' },
            { value: 'sandwich', label: 'Sandwich S7 Airlines' }
          ]}
        />
        <RadioGroupControl
          size="sm"
          disabled
          options={[
            { value: 'soup', label: 'Soup with tomatos' },
            { value: 'salat', label: 'Salat olivie' },
            { value: 'sandwich', label: 'Sandwich S7 Airlines' }
          ]}
        />
      </div>
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <RadioGroupControl
        options={[
          { value: 'soup', label: 'Basic plan' },
          { value: 'salat', label: 'Professional plan' },
          {
            value: 'sandwich',
            label:
              'This plan includes full access to all features, priority customer support, advanced security options, detailed analytics, and the ability to customize the system to fit internal processes. It is intended for companies that need reliability, scalability, and long-term support across multiple departments.'
          }
        ]}
      />
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <RadioGroupControl
        required
        options={[
          { value: 'soup', label: 'New York' },
          { value: 'salat', label: 'Beijing' }
        ]}
      />
    </div>
  )
}

interface Props<T> {
  size?: 'sm' | 'md'
  options: { value: T; label: string }[]
  disabled?: boolean
  required?: boolean
}

const RadioGroupControl = <T extends string>(props: Props<T>) => {
  const [value, setValue] = useState<null | T>(null)

  return <RadioGroup {...props} value={value} onChange={setValue} />
}
