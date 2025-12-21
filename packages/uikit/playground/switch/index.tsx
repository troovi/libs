import { Icon } from '@/Icon'
import { Switch, SwitchProps } from '@/Switch'
import { faCheck, faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

const longtext = `The expanded form makes it easy to schedule meetings: fields to fill out are displayed on the left, and the participants' schedule is shown on the right.`

export const SwitchExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-24">
        <div className="flex flex-col gap-12">
          <SwitchControl label="Accept terms and conditions" />
          <SwitchControl
            label="I want to recieve promote emails"
            checkedIcon={<Icon icon={faCheck} />}
            uncheckedIcon={<Icon icon={faClose} />}
          />
        </div>
        <div className="flex flex-col gap-12">
          <SwitchControl label="Accept terms and conditions" disabled defaultChecked />
          <SwitchControl label="I want to recieve promote emails" disabled />
        </div>
      </div>
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <div className="flex flex-col gap-12">
        <SwitchControl label="Accept terms and conditions" defaultChecked />
        <SwitchControl defaultChecked label={'Use the advanced form to create events'} />
        <SwitchControl label={longtext + ' ' + longtext} defaultChecked />
      </div>
    </div>
  )
}

interface Props extends Omit<SwitchProps, 'checked' | 'onCheckedChange'> {
  label?: React.ReactNode
  defaultChecked?: boolean
}

const SwitchControl = ({ defaultChecked, ...props }: Props) => {
  const [checked, setCheck] = useState(defaultChecked ?? false)

  return <Switch {...props} checked={checked} onCheckedChange={setCheck} />
}
