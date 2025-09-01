import { useState } from 'react'
import { NumberInput } from '@/NumberInput'

export const NumberInputs = () => {
  return (
    <div style={{ width: '200px' }}>
      <div style={{ color: '#ffffff', marginBottom: '10px' }}>NumberInputs</div>
      <div style={{ marginBottom: '20px' }}>
        <NumbInput1 />
      </div>
      <div>
        <NumbInput2 />
      </div>
    </div>
  )
}

const NumbInput1 = () => {
  const [value, onChange] = useState(0)
  return (
    <div className="flex flex-col">
      <NumberInput stepper step={0.01} value={value} onChange={onChange} />
      <div onClick={() => onChange(0)}>set 0</div>
    </div>
  )
}
const NumbInput2 = () => {
  const [value, onChange] = useState(0)
  return <NumberInput value={value} onChange={onChange} />
}
