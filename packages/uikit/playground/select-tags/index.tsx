import { SelectTags } from '@/SelectTags'
import { createOptions, useServerOptions } from '../helpers'
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
          <SelectTagsLoading />
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
      options={createOptions()}
    />
  )
}

const SelectTagsLoading = ({ required }: { required?: boolean } = {}) => {
  const [value, onChange] = useState<number[]>([])

  return (
    <SelectTags<number>
      value={value}
      onChange={onChange}
      required={required}
      placeholder="Загрузить варианты"
      useOptions={useServerOptions}
    />
  )
}
