import { useRef, useState } from 'react'
import { Form, FormProps } from '../Form'

export interface NumberInputProps extends Omit<FormProps, 'value' | 'onChange'> {
  value: number | null
  onChange: (value: number | null) => void
}

export const NumberInput = ({ value, onChange, ...props }: NumberInputProps) => {
  const [, rerender] = useState([])
  const input = useRef<string>(getInputValue(value))

  if (+input.current !== value) {
    input.current = getInputValue(value)
  }

  return (
    <Form
      {...props}
      value={input.current}
      onChange={(e) => {
        const source = (e.currentTarget.value as string).trim()

        if (source === '') {
          input.current = ''
          return onChange(null)
        }

        if (source.startsWith('.')) {
          return
        }

        const numbersigns = source.replace('.', '').split('')

        if (numbersigns.some((symbol) => isNaN(parseInt(symbol)))) {
          return
        }

        input.current = clean(source.split(''))

        if (+input.current === value) {
          return rerender([])
        }

        onChange(+input.current)
      }}
    />
  )
}

const getInputValue = (value: number | null) => {
  return value === null ? '' : value.toString()
}

const clean = (signs: string[]) => {
  const result = [...signs]
  const source = [...signs]

  if (source.every((value) => value === '0')) {
    return '0'
  }

  for (let i = 0; i < source.length; i++) {
    if (source[i] !== '0') {
      break
    }

    if (source[i] === '0' && source[i + 1] !== '.') {
      result.shift()
    }
  }

  return result.join('')
}
