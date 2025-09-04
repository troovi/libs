import { createForm } from '@troovi/chezit'
import { Select, Option } from '@troovi/uikit'

interface Params<V> {
  options: Option<V>[]
  icon?: JSX.Element
  fill?: boolean
  placeholder?: string
  className?: string
}

export const SelectForm = <T,>(value: T) => {
  return createForm<T, Params<T>>({
    defaultValue: value,
    getRequireCheck: (params) => (value) => {
      if (!params.options.map((o) => o.value).includes(value)) {
        throw ''
      }
    },
    getForm: (params) => {
      return ({ field: { onChange, value }, error, disabled }) => {
        return (
          <Select
            {...params}
            disabled={disabled}
            onChange={onChange}
            value={value}
            error={error !== null}
          />
        )
      }
    }
  })
}
