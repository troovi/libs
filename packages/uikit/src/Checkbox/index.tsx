import './Checkbox.scss'
import * as Headless from '@headlessui/react'
// import { CheckIcon } from '@heroicons/react/16/solid'

interface CheckboxProps {
  checked: boolean
  setChecked: (checked: boolean) => void
  label?: React.ReactNode
}

export const Checkbox = ({ checked, setChecked, label }: CheckboxProps) => {
  return (
    <Headless.Field className="checkbox-container">
      <Headless.Checkbox checked={checked} onChange={setChecked} className="checkbox">
        <div className="checkbox-icon-container">{/* <CheckIcon className="checkbox-icon" /> */}</div>
        {label && <Headless.Label>{label}</Headless.Label>}
      </Headless.Checkbox>
    </Headless.Field>
  )
}
