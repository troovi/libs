import isEqual from 'fast-deep-equal'

import { DeepPartial, FieldValues } from '../types'
import { FieldError, SchemeItems } from '../core/types'
import { readScheme } from './read-scheme'
import { createValues } from './create-value'
import { ChangeEvent, DirtyEvent, MainOptions, SetError, SubmitCallbacls } from '../useForm'

interface FormItem {
  isDirty: boolean
  error: FieldError | null
  startValue: any
  defaultValue: any
  value: any
  rerender: () => void
  focus?: () => void
  validate: (value: any) => FieldError | void
  subscribers: { callback: () => void }[]
}

export interface Forms {
  [name: string]: FormItem
}

export interface ResetOptions {
  asDirty?: boolean
}

export interface FormManager<Values, FlattenValues, ClonedValues> {
  submitRef: { onSubmit: (values: Values, callbacks: SubmitCallbacls<FlattenValues>) => void }
  scheme: SchemeItems.All[]
  disabled?: boolean
  activate: () => void
  disactivate: () => void
  handleSubmit: () => Promise<void>
  registry: (name: string, callback: () => void) => { unregistry: () => void }
  subscribeToForm: (name: string, callback: () => void) => { unsubscribe: () => void }
  registryExtraForm: (names: string[], callback: () => void) => { unregistry: () => void }
  getForm: (name: string) => FormItem
  onChange: (name: string, value: any) => void
  setFocus: (name: keyof FlattenValues) => void
  setValue: <K extends keyof FlattenValues>(name: K, value: FlattenValues[K]) => void
  setError: SetError<FlattenValues>
  reset: (v: DeepPartial<ClonedValues>, options: ResetOptions) => void
  getValues: () => DeepPartial<ClonedValues>
}

// prettier-ignore
export const createFormManager = <Values extends FieldValues, Flatten, Cloned>(scheme: SchemeItems.All[], options: MainOptions<Values, Flatten, Cloned>): FormManager<Values, Flatten, Cloned> => {
  const { onSubmit, onEqual, disabled, onDirty, onFormDirty, onChangeEvent, defaultValues } = options

  // can be redefined on rerenders
  const submitRef = { onSubmit }

  const state = {
    isActive: false,
    isSubmitted: false,
    dirtyCount: 0
  }

  const forms: Forms = {}

  const extraForms = {
    subscribers: [] as { visualizeEvalueatedForms: () => void }[],
    names: {} as Record<string, boolean>
  }

  readScheme(scheme, [], defaultValues ?? {}, (form, name, defaultValue) => {
    forms[name] = {
      error: null,
      isDirty: false,
      value: defaultValue, // текущее (динамическое) состояние поля. Значение равно переданному дефолтному, либо: определяется как дефолтное значение компонента формы в момент его монтирования, а до этого - undefined.
      startValue: defaultValue ?? form.defaultValue, // начальное (стартовое) значение (равно переданному дефолтному, либо значению формы по умолчанию). Исходя из сравнения текущего значения со стартовым, можно понять, модифицированно ли поле
      defaultValue: form.defaultValue, // дефолтное значение компонента формы
      rerender: () => {},
      subscribers: [],
      validate: form.validate
    }
  })

  const handleDirty = (name: string, isDirty: boolean) => {
    onDirty?.({ name, isDirty } as DirtyEvent<Flatten>)

    if (isDirty && state.dirtyCount === 0) {
      onFormDirty?.(true)
    }

    if (!isDirty && state.dirtyCount === 1) {
      onFormDirty?.(false)
    }

    state.dirtyCount += isDirty ? 1 : -1
  }

  return {
    submitRef,
    scheme,
    disabled,
    activate() {
      state.isActive = true
    },
    disactivate() {
      state.isActive = false
    },
    setError(name, error) {
      const form = this.getForm(name as string)

      if (form) {
        form.error = {
          error: true,
          messages: [error.message]
        }

        form.rerender()
      }
    },
    setFocus(name) {
      const form = this.getForm(name as string)

      if (form && form.focus) {
        form.focus()
      }
    },
    setValue(name, value) {
      const form = this.getForm(name as string)

      if (form && form.value !== value) {
        this.onChange(name as string, value)
      }
    },
    getValues() {
      return createValues<DeepPartial<Cloned>>(scheme, forms)
    },
    async handleSubmit() {
      if (disabled) {
        return
      }

      state.isSubmitted = true

      let isFocusSetted = false
      let isErrorsExist = false

      // validating
      for (const name in forms) {
        const item = forms[name]

        if (item.value !== undefined) {
          const error = item.validate(item.value)

          if (error) {
            isErrorsExist = true

            item.error = error
            item.rerender()

            if (!isFocusSetted && item.focus) {
              item.focus()
              isFocusSetted = true
            }
          }
        }
      }

      if (!isErrorsExist) {
        if (state.dirtyCount === 0) {
          onEqual?.()
          return
        }

        const values = createValues<Values>(scheme, forms)

        await submitRef.onSubmit(values, {
          setError: (name, error) => {
            const form = this.getForm(name as string)

            form.error = {
              error: true,
              messages: [error.message]
            }

            form.rerender()
          }
        })
      }
    },
    reset(values, { asDirty }) {
      readScheme(scheme, [], values, (form, name, value) => {
        // неопределенные значения не показанных условий/extra-полей
        // note: если extra поле не смонтировано, его value равен undefined
        if (value === undefined && forms[name].value === undefined) {
          return
        }

        // удаление extra-поля, при неопределенном значении
        if (extraForms.names[name] && value === undefined) {
          forms[name].value = value
          return
        }

        const nextValue = value ?? form.defaultValue

        if(!asDirty){
          forms[name].startValue = nextValue
          forms[name].isDirty = false
        }
        
        if (forms[name].value !== nextValue) {
          this.onChange(name, nextValue)
        }
      })

      if(!asDirty){
        state.dirtyCount = 0
        state.isSubmitted = false
      }
      
      // делаем ререндер extra формы, чтобы отобразить оцененные поля, либо убрать неоцененные
      extraForms.subscribers.forEach(({ visualizeEvalueatedForms }) => {
        visualizeEvalueatedForms()
      })
    },
    registry(name, rerenderCb) {
      forms[name].rerender = rerenderCb

      if (forms[name].value === undefined) {
        forms[name].value = forms[name].defaultValue
      }

      return {
        unregistry() {
          forms[name].rerender = () => {}
          forms[name].focus = undefined

          // при удалении поля из extraForm, должно возникать isDirty состояние, 
          // если значение которое в нем хранилось, отличается от дефолтного значение формы
          if (state.isActive) {
            forms[name].value = undefined

            const isDirty = !isEqual(forms[name].startValue, forms[name].defaultValue)

            if (forms[name].isDirty !== isDirty) {
              handleDirty(name, isDirty)
            }

            forms[name].isDirty = isDirty
          }
        }
      }
    },
    getForm(name) {
      return forms[name]
    },
    subscribeToForm(name, callback) {
      const observer = { callback }
      const form = this.getForm(name)

      form.subscribers.push(observer)

      return {
        unsubscribe: () => {
          form.subscribers = form.subscribers.filter((o) => o !== observer)
        }
      }
    },
    registryExtraForm(names, visualizeEvalueatedForms) {
      const observer = { visualizeEvalueatedForms }

      names.forEach((name) => {
        extraForms.names[name] = true
      })

      extraForms.subscribers.push(observer)

      return {
        unregistry() {
          extraForms.subscribers = extraForms.subscribers.filter((o) => o !== observer)
        }
      }
    },
    onChange(name, value) {
      const form = this.getForm(name)

      // checking dirty
      const isDirty = !isEqual(value, form.startValue)

      if (form.isDirty !== isDirty) {
        handleDirty(name, isDirty)
      }

      form.isDirty = isDirty

      // callback
      onChangeEvent?.({ name, value } as ChangeEvent<Flatten>)

      // validate error if neccesery
      if (form.error || state.isSubmitted) {
        form.error = form.validate(value) || null
      }

      // update values
      form.value = value
      form.rerender()

      // trigger subscribers
      form.subscribers.forEach(({ callback }) => {
        callback()
      })
    }
  }
}
