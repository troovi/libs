import type { FieldError, SchemeItems } from '../types'

import { getError } from '../../utils/get-error'
import { RefCallBack } from '../../types'

export interface FieldControl<V> {
  value: V
  onChange: (value: V) => void
  onBlur: () => void
  ref: RefCallBack
  disabled?: boolean
}

export interface FormControl<V> {
  field: FieldControl<V>
  isDirty: boolean
  disabled?: boolean
  error: FieldError | null
}

export interface Rules<V> {
  $rules?: {
    required?: boolean
    /**
     *  Validation will execute only after satisfies the required condition
     */
    validate?: (value: V) => void
  }
}

export interface FormBuilder<P, V> {
  defaultValue: V
  getRequireCheck: (params: P) => (value: V) => void
  getForm: (params: P) => (control: FormControl<V>) => React.ReactNode
}

export const createForm = <V, P>(builder: FormBuilder<P, V>) => {
  return <N extends string>(name: N, params: P & Rules<V>): SchemeItems.Form<N, V, P> => {
    const check = builder.getRequireCheck(params)

    const { validate, required } = params.$rules ?? {}

    return {
      type: 'form',
      name,
      defaultValue: builder.defaultValue,
      Form: builder.getForm(params),
      validate: (value) => {
        // required case
        if (required) {
          const error = getError(() => check(value))

          if (error) {
            return error
          }

          if (validate) {
            const errors = getError(() => validate(value))

            if (errors) {
              return errors
            }
          }

          return
        }

        // if validate provided without required check, validation
        // will execute only if value satisfies the required condition

        if (validate) {
          const error = getError(() => check(value))

          if (!error) {
            const error = getError(() => validate(value))

            if (error) {
              return error
            }
          }
        }
      }
    }
  }
}
