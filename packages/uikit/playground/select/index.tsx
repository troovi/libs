import { useState } from 'react'
import { Select } from '@/Select'
import { Icon } from '@/Icon'
import { faGift } from '@companix/icons-solid'

export const SelectExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <div style={{ minWidth: '200px', width: '200px' }}>
          <SelectItem />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: '240px', width: '240px' }}>
          <SelectItemClosable icon={<Icon icon={faGift} size="xxs" className="form-space-margin" />} />
        </div>
        <div style={{ minWidth: 0, width: '100%' }}>
          <SelectItem fill icon={<Icon icon={faGift} size="xxs" className="form-space-margin" />} />
        </div>
      </div>
      {/* <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <div className="row-group">
        <div style={{ minWidth: '200px', width: '200px' }}>
          <SelectItem />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: '240px', width: '240px' }}>
          <SelectItem
            clearButton
            icon={<Icon icon={faGift} size="xxs" className="form-space-margin" />}
          />
        </div>
        <div style={{ minWidth: 0, width: '100%' }}>
          <SelectItem fill icon={<Icon icon={faGift} size="xxs" className="form-space-margin" />} />
        </div>
      </div> */}
    </div>
  )
}

interface ItemProps {
  fill?: boolean
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
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

const SelectItem = ({ fill, icon, size }: ItemProps) => {
  const [value, onChange] = useState<null | number>(null)

  return (
    <Select<number>
      value={value}
      onChange={onChange}
      leftElement={icon}
      fill={fill}
      size={size}
      placeholder="Не выбрано"
      options={options}
    />
  )
}

const SelectItemClosable = ({ fill, icon, size }: ItemProps) => {
  const [value, onChange] = useState<null | number>(null)

  return (
    <Select<number>
      value={value}
      onChange={onChange}
      leftElement={icon}
      clearButton
      fill={fill}
      size={size}
      placeholder="Не выбрано"
      options={options}
    />
  )
}
