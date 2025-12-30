import { useState } from 'react'
import { NumberInput, ReactNumberFormatParams } from '@/NumberInput'

export const NumberInputs = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <NumberInputControlled
          placeholder="Enter the price"
          thousandSeparator=" "
          suffix=" ₽"
          allowNegative={false}
        />
        <NumberInputControlled
          placeholder="Amount of coin"
          fixedDecimalScale
          decimalScale={4}
          allowLeadingZeros={false}
        />
      </div>
    </div>
  )
}

// const NumbInput1 = () => {
//   const [value, onChange] = useState(0)
//   return (
//     <div className="flex flex-col">
//       {/* <StepperInput buttons step={0.01} value={value} onChange={onChange} /> */}
//       <div onClick={() => onChange(0)}>set 0</div>
//     </div>
//   )
// }

// const NumbInput2 = () => {
//   const [value, onChange] = useState(0)

//   return null

//   // return <StepperInput step={1} value={value} onChange={onChange} />
// }

const NumberInputControlled = (params: ReactNumberFormatParams & { placeholder: string }) => {
  const [value, setInputValue] = useState<null | number>(null)

  return <NumberInput value={value} onValueChange={setInputValue} {...params} />
}
