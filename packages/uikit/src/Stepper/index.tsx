import './StepperInput.scss'

import { ChevronDown, ChevronUp } from '@blueprintjs/icons'
import { Form } from '../Form'
import { useStepperInput, StepperInputOptions } from '../__hooks/use-stepper-input'
import { usePress } from '@react-aria/interactions'
import { Button } from '../Button'
import { attr } from '@troovi/utils-browser'

interface StepperInputProps extends StepperInputOptions {
  buttons?: boolean
  placeholder?: string
  inputStyle?: React.CSSProperties
}

export const StepperInput = ({ inputStyle, placeholder, buttons, ...options }: StepperInputProps) => {
  const { inputRef, increment, decrement, handleChange, value } = useStepperInput(options)

  return (
    <div className="number-input-container">
      <Form
        ref={inputRef}
        placeholder={placeholder}
        style={inputStyle}
        value={value}
        onChange={handleChange}
      />
      {buttons && <Stepper increment={increment} decrement={decrement} />}
    </div>
  )
}

interface StepperProps {
  increment: () => void
  decrement: () => void
}

const Stepper = ({ increment, decrement }: StepperProps) => {
  return (
    <div className="number-stepper">
      <SlepButton slot="increment" onClick={increment}>
        <ChevronUp size={14} />
      </SlepButton>
      <div className="number-stepper-splitter" />
      <SlepButton slot="decrement" onClick={decrement}>
        <ChevronDown size={14} />
      </SlepButton>
    </div>
  )
}

interface ButtonProps {
  children: React.ReactNode
  slot: string
  onClick: () => void
}

const SlepButton = ({ children, slot, onClick }: ButtonProps) => {
  const { pressProps, isPressed } = usePress({ onClick, preventFocusOnPress: true })
  const { onBeforeInput, ...rest } = pressProps

  return (
    <Button
      {...rest}
      onBeforeInput={onBeforeInput as any}
      data-slot={slot}
      data-size={undefined}
      data-pressed={attr(isPressed)}
      style={{ border: 'none' }}
      className="number-stepper-slot"
    >
      {children}
    </Button>
  )
}
