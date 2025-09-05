import { NumberInput } from '@troovi/uikit'
import { createForm } from '@troovi/chezit'
import { ErrorMessage } from '../ErrorMessage'

interface Params {
  placeholder: string
}

export const NumberFormInput = createForm<number | null, Params>({
  defaultValue: null,
  getRequireCheck: () => (value) => {
    if (value === null) {
      throw ''
    }
  },
  getForm: (params) => {
    return ({ field: { ref, onChange, value, ...restFiled }, error, disabled }) => {
      return (
        <>
          <NumberInput
            {...restFiled}
            value={value}
            placeholder={params.placeholder}
            error={error !== null}
            autoComplete="off"
            disabled={disabled}
            onChange={onChange}
          />
          <ErrorMessage error={error} />
        </>
      )
    }
  }
})
