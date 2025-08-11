import './Radio.scss'

import cn from 'classnames'
import * as Headless from '@headlessui/react'
import { attr } from '@troovi/utils-browser'

interface RadioProps {
  checked: boolean
  className?: string
  setChecked: (checked: boolean) => void
  label?: React.ReactNode
}

export const Radio = ({ className, checked, setChecked, label }: RadioProps) => {
  return (
    <div onClick={() => setChecked(!checked)} className={cn('radio', className)}>
      <div className="radio-icon" data-checked={attr(checked)} />
      {label && <Headless.Label>{label}</Headless.Label>}
    </div>
  )
}
