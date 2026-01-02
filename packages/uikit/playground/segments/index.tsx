import { Segments } from '@/Segments'
import { useState } from 'react'

export const SegmentsExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <Segmentsontroller />
      </div>
    </div>
  )
}

const Segmentsontroller = () => {
  const [value, setValue] = useState('live')

  return (
    <Segments
      value={value}
      onChange={setValue}
      options={[
        { label: 'Live', value: 'live' },
        { label: 'Archive', value: 'archive' },
        { label: 'Trash', value: 'trash' }
      ]}
    />
  )
}
