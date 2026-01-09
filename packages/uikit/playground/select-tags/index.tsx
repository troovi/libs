import { SelectTags } from '@/SelectTags'
import { useState } from 'react'

export const SelectTagsExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-12">
        <div style={{ maxWidth: '380px' }}>
          <SelectTagsControl />
        </div>
        <div style={{ maxWidth: '380px' }}>
          <SelectTagsControl required />
        </div>
        <div style={{ maxWidth: '380px' }}>
          <SelectTagsControl2 />
        </div>
      </div>
    </div>
  )
}

const SelectTagsControl = ({ fill, required }: { fill?: boolean; required?: boolean } = {}) => {
  const [value, onChange] = useState<number[]>([])

  return (
    <SelectTags<number>
      value={value}
      onChange={onChange}
      fill={fill}
      required={required}
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

const SelectTagsControl2 = ({ fill, required }: { fill?: boolean; required?: boolean } = {}) => {
  const [value, onChange] = useState<number[]>([])
  const [isLoading, setLoading] = useState(false)

  return (
    <SelectTags<number>
      value={value}
      onChange={onChange}
      fill={fill}
      required={required}
      isLoading={isLoading}
      onPopoverOpen={setLoading}
      placeholder="Выберите варианты"
      options={[]}
    />
  )
}
