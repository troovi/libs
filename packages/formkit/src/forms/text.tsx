import { createForm } from '@troovi/chezit'
import { Input } from '@troovi/uikit'
import { ErrorMessage } from '../ErrorMessage'

interface Params {
  placeholder: string
}

export const TextInput = createForm<string, Params>({
  defaultValue: '',
  getRequireCheck: () => (value) => {
    if (value.trim() === '') {
      throw ''
    }
  },
  getForm: (params) => {
    return ({ field: { ref, onChange, ...restFiled }, error, disabled }) => {
      return (
        <>
          <Input
            {...restFiled}
            onChange={(e) => onChange(e.currentTarget.value)}
            ref={ref}
            placeholder={params.placeholder}
            error={error !== null}
            autoComplete="off"
            disabled={disabled}
          />
          <ErrorMessage error={error} />
        </>
      )
    }
  }
})
