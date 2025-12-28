import { Icon } from '@/Icon'
import { Input } from '@/Input/Input'
import { faEye, faEyeSlash, faSearch } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

const sizes = ['lg', 'md', 'sm'] as const

export const InputsExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <PasswordInput />
        <PasswordInput2 />
        <ChangeSize />
        <div className="flex-1 flex">
          <Input
            fill
            placeholder="Fullwidth input"
            leftElement={<Icon size="xxs" icon={faSearch} className="quieter form-space-margin" />}
          />
        </div>
      </div>
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <div className="flex gap-10">
        <div className="flex flex-col gap-10">
          {sizes.map((size) => {
            return <Input key={`input-size-${size}`} size={size} placeholder={`Input size ${size}`} />
          })}
        </div>
        <div className="flex flex-col gap-10">
          {sizes.map((size) => {
            return (
              <Input
                key={`input-size-${size}-disabled`}
                size={size}
                placeholder={`Input disabled ${size}`}
                leftElement={<Icon size="xxs" icon={faSearch} className="quieter form-space-margin" />}
                disabled
              />
            )
          })}
        </div>
        <div className="flex flex-col gap-10">
          {sizes.map((size) => {
            return (
              <Input
                key={`input-size-${size}-required`}
                size={size}
                placeholder={`Input required ${size}`}
                leftElement={<Icon size="xxs" icon={faSearch} className="quieter form-space-margin" />}
                required
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const PasswordInput = () => {
  const [state, setState] = useState(false)

  return (
    <Input
      placeholder={`Slot right`}
      rightElement={
        <div
          onClick={() => setState((x) => !x)}
          data-side={'right'}
          className="form-slot center h-full cursor-pointer"
        >
          {state ? <Icon size="xxs" icon={faEye} /> : <Icon size="xxs" icon={faEyeSlash} />}
        </div>
      }
    />
  )
}

const PasswordInput2 = () => {
  return (
    <Input
      placeholder={`Slot left`}
      leftElement={
        <div data-side={'left'} className="form-slot center h-full gap-6 cursor-pointer">
          <Icon size="xxs" icon={faEye} />
        </div>
      }
    />
  )
}

const ChangeSize = () => {
  const [value, setValue] = useState('')

  return (
    <Input
      placeholder="Dynamic element"
      value={value}
      onValueChange={setValue}
      leftElement={<Icon size="xxs" icon={faSearch} className="quieter form-space-margin" />}
      rightElement={
        <div className="form-space-margin flex items-center h-full cursor-pointer">
          <div
            className="rounded-md px-4 pointer-events-auto"
            style={{ backgroundColor: 'rgba(143, 153, 168, .15)' }}
          >
            {Math.floor(10000 / Math.max(1, Math.pow(value.length, 2)))}
          </div>
        </div>
      }
    />
  )
}
