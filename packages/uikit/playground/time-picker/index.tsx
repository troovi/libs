import { Icon } from '@/Icon'
import { TimePicker, TimePickerProps } from '@/TimePicker'
import { TimeFormat } from '@/types'
import { faClock } from '@fortawesome/free-regular-svg-icons'
// import { faClock } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export const TimePickerExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <TimePickerController />
        <TimePickerController
          leftElement={<Icon icon={faClock} size="xxs" className="form-space-margin quieter" />}
        />
        <TimePickerController
          clearButton
          leftElement={<Icon icon={faClock} size="xxs" className="form-space-margin quieter" />}
        />
        <div className="flex flex-1">
          <TimePickerController fill />
        </div>
      </div>
    </div>
  )
}

const TimePickerController = (props: Omit<TimePickerProps, 'value' | 'onChange'>) => {
  const [value, setValue] = useState<null | TimeFormat>(null)

  return <TimePicker {...props} value={value} onChange={setValue} />
}
