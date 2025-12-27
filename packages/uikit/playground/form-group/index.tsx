import { FormGroup } from '@/FormLabel'
import { Input } from '@/Input'
import { DatePickerControl } from '../date-picker'
import { TextArea } from '@/TextArea'

export const FormGroupExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-18">
        <FormGroup label="Event name">
          <Input placeholder="What is your event?" />
        </FormGroup>
        <FormGroup label="Event name" caption="Field is required">
          <Input placeholder="What is your event?" />
        </FormGroup>
        <FormGroup label="Event name" caption="Field is required" apperance="negative">
          <Input placeholder="What is your event?" required />
        </FormGroup>
        <FormGroup label="Birthday">
          <DatePickerControl />
        </FormGroup>
        <FormGroup label="Leave a comment" caption="Can grow">
          <TextArea placeholder="Resizable and fill" fill />
        </FormGroup>
      </div>
    </div>
  )
}
