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

export interface Rules<V, R extends boolean = boolean> {
  $rules?: {
    /**
     * Поле обязательное: пустое не проходит проверку, и в значениях отправки поле без `null` и `undefined`. Сужает
     * тип только литерал `true`; флаг-переменная (`boolean`) оставляет тип как есть.
     */
    required?: R
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
  // R — только из $rules: без NoInfer раскладка и контекст, куда поставлено поле, расширяют true до boolean
  // prettier-ignore
  return <N extends string, R extends boolean = false>(name: N, params: P & Rules<V, R>): SchemeItems.Form<N, V, P, NoInfer<R>> => {
    const check = builder.getRequireCheck(params)

    const { $rules = {}, ...clientParams } = params
    const { validate, required } = $rules

    return {
      type: 'form',
      name,
      defaultValue: builder.defaultValue,
      required: (required ?? false) as R,
      Form: builder.getForm(clientParams as P),
      validate: (value) => {
        // required case
        if (required) {
          // пустое (null, undefined) обязательное поле не проходит при любом примитиве: на этом держится тип
          // значений отправки
          if (value === null || value === undefined) {
            return { error: true }
          }

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
