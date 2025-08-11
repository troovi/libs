import cn from 'classnames'
import { SmallTick } from '@blueprintjs/icons'
import './Checkbox.scss'
import * as Headless from '@headlessui/react'
import { attr } from '@troovi/utils-browser'

interface CheckboxProps {
  checked: boolean
  className?: string
  setChecked: (checked: boolean) => void
  label?: React.ReactNode
}

export const Checkbox = ({ className, checked, setChecked, label }: CheckboxProps) => {
  return (
    <Headless.Field>
      <Headless.Checkbox checked={checked} onChange={setChecked} className={cn('checkbox', className)}>
        <div className="checkbox-icon-container" data-checked={attr(checked)}>
          {checked && <SmallTick className="checkbox-icon" size={14} />}
        </div>
        {label && <Headless.Label>{label}</Headless.Label>}
      </Headless.Checkbox>
    </Headless.Field>
  )
}
