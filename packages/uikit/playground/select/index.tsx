import { useState } from 'react'
import { Select, SelectParams } from '@/Select'
import { Icon } from '@/Icon'
import { faGift } from '@companix/icons-solid'
import { useServerOptions } from '../helpers'

export const SelectExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <div style={{ minWidth: '200px', width: '200px' }}>
          <SelectItem />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: '240px', width: '240px' }}>
          <SelectItemClosable
            leftElement={<Icon icon={faGift} size="xxs" className="form-space-margin" />}
          />
        </div>
        <div style={{ minWidth: '200px', width: '200px' }}>
          <SelectItemLoading />
        </div>
        <div style={{ minWidth: 0, width: '100%' }}>
          <SelectItem
            fill
            leftElement={<Icon icon={faGift} size="xxs" className="form-space-margin" />}
            addOption={{
              text: 'Добавить вариант',
              onClick: () => {}
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface ItemProps extends SelectParams {
  fill?: boolean
  leftElement?: React.ReactNode
}

const options = [
  { value: 1, title: 'Vladimir Putin' },
  { value: 2, title: 'Donald Trump' },
  { value: 3, title: 'Sergey Lavrov' },
  ...new Array(10).fill(0).map((_, i) => ({
    title: `Value ${i + 4}`,
    value: i + 4
  }))
]

export const SelectItem = (props: ItemProps) => {
  const [value, onChange] = useState<null | number>(null)

  return (
    <Select<number>
      value={value}
      onChange={(value) => onChange(value)}
      {...props}
      placeholder="Не выбрано"
      options={options}
    />
  )
}

const SelectItemClosable = (props: ItemProps) => {
  const [value, onChange] = useState<null | number>(null)

  return (
    <Select<number>
      value={value}
      onChange={onChange}
      clearButton
      {...props}
      placeholder="Не выбрано"
      options={options}
    />
  )
}

const SelectItemLoading = ({ required }: { required?: boolean } = {}) => {
  const [value, onChange] = useState<number | null>(null)

  return (
    <Select<number>
      value={value}
      onChange={onChange}
      required={required}
      placeholder="Выбрать вариант"
      useOptions={useServerOptions}
    />
  )
}
