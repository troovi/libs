import { useState } from 'react'
import { StepperInput } from '@/Stepper'
import { NumberInput } from '@/NumberInput'

export const NumberInputs = () => {
  return (
    <div className="flex flex-col gap-22" style={{ width: '200px' }}>
      <div>NumberInputs</div>
      <div>
        <NumbInput1 />
      </div>
      <div>
        <NumbInput2 />
      </div>
      <div>
        <NumbInput3 />
      </div>
    </div>
  )
}

const NumbInput1 = () => {
  const [value, onChange] = useState(0)
  return (
    <div className="flex flex-col">
      <StepperInput buttons step={0.01} value={value} onChange={onChange} />
      <div onClick={() => onChange(0)}>set 0</div>
    </div>
  )
}

const NumbInput2 = () => {
  const [value, onChange] = useState(0)

  return <StepperInput step={1} value={value} onChange={onChange} />
}

const NumbInput3 = () => {
  const [value, onChange] = useState<number | null>(0)

  console.log(value)

  return (
    <div>
      <NumberInput value={value} onChange={onChange} />
      <div onClick={() => onChange(1122)}>Set 1122</div>
      <div onClick={() => onChange(null)}>Set null</div>
    </div>
  )
}
