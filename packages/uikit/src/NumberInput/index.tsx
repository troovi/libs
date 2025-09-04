import { useRef, useState } from 'react'
import { Input, InputProps } from '../Input'

export interface NumberInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
}

export const NumberInput = ({ value, onChange, ...props }: NumberInputProps) => {
  const [, rerender] = useState([])
  const state = useRef<string>(value.toString())

  return (
    <Input
      {...props}
      value={state.current === '0' ? '' : state.current}
      onChange={(e) => {
        const source = (e.currentTarget.value as string).trim()

        if (source.startsWith('.')) {
          return
        }

        const numbersigns = source.replace('.', '').split('')

        if (numbersigns.some((symbol) => isNaN(parseInt(symbol)))) {
          return
        }

        state.current = source.replace(/^0+/, '')

        if (+state.current === value) {
          return rerender([])
        }

        onChange(+state.current)
      }}
    />
  )
}
