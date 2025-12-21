import { TextArea } from '@/TextArea'

export const TextAreaExample = () => {
  return (
    <div className="col-group">
      <div className="flex items-start gap-10">
        <TextArea grow placeholder="Auto growing" />
        <TextArea grow placeholder="Growing limited" style={{ maxHeight: '240px' }} />
        <TextArea placeholder="Resizable and fill" fill />
      </div>
      <div className="flex items-start gap-10">
        <TextArea grow placeholder="Auto growing" disabled />
        <TextArea grow placeholder="Growing limited" style={{ maxHeight: '240px' }} required />
      </div>
    </div>
  )
}
