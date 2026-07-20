import { useState } from 'react'
import { CounterInput, CounterInputProps } from '@/CounterInput'

export const CounterInputExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <CounterInputControlled placeholder="0" min={0} max={10} />
        <CounterInputControlled placeholder="0" step={0.5} decimalScale={1} />
        <CounterInputControlled placeholder="0" min={0} max={5} disabled />
      </div>
    </div>
  )
}

const CounterInputControlled = (params: Omit<CounterInputProps, 'value' | 'onValueChange'>) => {
  const [value, setValue] = useState<null | number>(null)

  return <CounterInput value={value} onValueChange={setValue} {...params} />
}
