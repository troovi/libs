import { SelectTags } from '@/SelectTags'
import { useState } from 'react'

export const SelectTagsExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <div style={{ maxWidth: '380px' }}>
          <SelectTagsControl />
        </div>
      </div>
    </div>
  )
}

const SelectTagsControl = ({ fill }: { fill?: boolean } = {}) => {
  const [value, onChange] = useState<number[]>([])

  return (
    <SelectTags<number>
      value={value}
      onChange={onChange}
      fill={fill}
      placeholder="Выберите варианты"
      options={[
        { value: 1, title: 'Vladimir Putin' },
        { value: 2, title: 'Donald Trump' },
        { value: 3, title: 'Sergey Lavrov' },
        ...new Array(10).fill(0).map((_, i) => ({
          title: `Value ${i + 4}`,
          value: i + 4
        }))
      ]}
    />
  )
}
