import { Checkbox } from '@/Checkbox'
import { Icon } from '@/Icon'
import { Tooltip } from '@/Tooltip'
import { faCircleInfo } from '@companix/icons-solid'
import { useState } from 'react'

const longtext = `The expanded form makes it easy to schedule meetings: fields to fill out are displayed on the left, and the participants' schedule is shown on the right.`

export const CheckboxExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-24">
        <div className="flex flex-col gap-12">
          <CheckboxControl label="Accept terms and conditions" size="md" defaultChecked />
          <CheckboxControl label="I want to recieve promote emails" size="sm" defaultChecked />
        </div>
        <div className="flex flex-col gap-12">
          <CheckboxControl label="Accept terms and conditions" size="md" disabled defaultChecked />
          <CheckboxControl label="I want to recieve promote emails" size="sm" disabled />
        </div>
      </div>
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <div className="flex flex-col gap-12">
        <CheckboxControl label="Accept terms and conditions" size="md" defaultChecked />
        <CheckboxControl
          size="md"
          defaultChecked
          label={
            <>
              <span>Use the advanced form to create events</span>
              <Tooltip side="top" content={longtext}>
                <span className="help-tip">
                  <Icon icon={faCircleInfo} size="xxxs" />
                </span>
              </Tooltip>
            </>
          }
        />
        <CheckboxControl label={longtext + ' ' + longtext} size="md" defaultChecked />
      </div>
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <div>
        <div className="flex flex-col gap-12">
          <CheckboxControl label="Accept terms and conditions" size="md" required />
          <CheckboxControl label="I want to recieve promote emails" size="sm" required />
        </div>
      </div>
    </div>
  )
}

interface Props {
  label?: React.ReactNode
  size?: 'md' | 'sm'
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
}

const CheckboxControl = ({ defaultChecked, ...props }: Props) => {
  const [checked, setCheck] = useState(defaultChecked ?? false)

  return <Checkbox {...props} checked={checked} onCheckedChange={setCheck} />
}
