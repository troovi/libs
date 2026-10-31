import isEqual from 'fast-deep-equal'

import { DeepPartial, FieldValues } from '../types'
import { FieldError, SchemeItems } from '../core/types'
import { readScheme, readShown } from './read-scheme'
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
  subscribers: { callback: (value: any, prevValue: any) => void }[]
}

export interface Forms {
  [name: string]: FormItem
}

export interface ResetOptions {
  asDirty?: boolean
}

export interface FormManager<Values, FlattenValues, ClonedValues> {
  submitRef: { onSubmit?: (values: Values, callbacks: SubmitCallbacls<FlattenValues>) => Promise<void> }
  changeRef: { onChange?: (values: Values) => void }
  scheme: SchemeItems.All[]
  disabled?: boolean
  activate: () => void
  disactivate: () => void
  handleSubmit: () => Promise<void>
  registry: (name: string, callback: () => void) => { unregistry: () => void }
  subscribeToForm: <K extends keyof FlattenValues>(
    name: K & string,
    callback: (value: FlattenValues[K], prevValue: FlattenValues[K]) => void
  ) => () => void
  // подписка на ЛЮБОЕ изменение значений формы (срабатывает на каждый onChange); возвращает отписку
  subscribeToAny: (callback: () => void) => () => void
  // плоский список имён всех полей схемы (dotted-пути, вложенные context раскрыты)
  getNames: () => string[]
  registryExtraForm: (names: string[], callback: () => void) => { unregistry: () => void }
  getForm: (name: string) => FormItem
  onChange: (name: string, value: any) => void
  setFocus: (name: keyof FlattenValues) => void
  setValue: <K extends keyof FlattenValues>(name: K, value: FlattenValues[K]) => void
  setError: SetError<FlattenValues>
  reset: (v: DeepPartial<ClonedValues>, options: ResetOptions) => void
  setAsDefault: () => void
  getValues: () => DeepPartial<ClonedValues>
}

// prettier-ignore
export const createFormManager = <Values extends FieldValues, Flatten, Cloned>(scheme: SchemeItems.All[], options: MainOptions<Values, Flatten, Cloned>): FormManager<Values, Flatten, Cloned> => {
  const { onSubmit, onChange, onEqual, disabled, onDirty, onFormDirty, onChangeEvent, defaultValues } = options

  // can be redefined on rerenders
  const submitRef = { onSubmit }
  const changeRef = { onChange }

  const state = {
    isActive: false,
    isSubmitted: false,
    dirtyCount: 0
  }

  const forms: Forms = {}

  // подписчики на любое изменение формы (для гейтов/агрегатов поверх всех полей)
  const anySubscribers = new Set<() => void>()

  const extraForms = {
    subscribers: [] as { visualizeEvalueatedForms: () => void }[],
    names: {} as Record<string, boolean>
  }

  readScheme(scheme, [], defaultValues ?? {}, (form, name, defaultValue) => {
    forms[name] = {
      error: null,
      isDirty: false,
      value: defaultValue, // текущее (динамическое) состояние поля. Значение равно переданному дефолтному, либо: определяется как стартовое значение в момент монтирования поля, а до этого - undefined. Поле, которое скрыло условие, значения не имеет.
      startValue: defaultValue ?? form.defaultValue, // начальное (стартовое) значение (равно переданному дефолтному, либо значению формы по умолчанию). С него начинает поле при монтировании, в том числе снова показанное условием; исходя из сравнения текущего значения со стартовым, можно понять, модифицированно ли поле
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

  // форма стала стартовой: каждое снятое изменение уходит в onDirty, последнее — и в onFormDirty(false)
  const markClean = () => {
    for (const name in forms) {
      if (forms[name].isDirty) {
        handleDirty(name, false)
        forms[name].isDirty = false
      }
    }
  }

  return {
    submitRef,
    changeRef,
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

      // validating: проверяются поля, которые форма показывает, — скрытое поле в отправку не входит,
      // а его ошибку не увидеть и не исправить
      readShown(scheme, [], forms, (name) => {
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
      })

      if (!isErrorsExist) {
        if (state.dirtyCount === 0 && onEqual) {
          onEqual()
          return
        }

        // форма без отправки — её значения уходят через onChange
        if (!submitRef.onSubmit) {
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
        }).catch((e) => {
          console.log('[formkit] submit exception:', e)
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
          forms[name].value = undefined
          return
        }

        const nextValue = value ?? form.defaultValue

        // изменённость поля onChange считает уже от нового стартового значения
        if(!asDirty){
          forms[name].startValue = nextValue
        }

        if (forms[name].value !== nextValue) {
          this.onChange(name, nextValue)
        }
      })

      if(!asDirty){
        markClean()
        state.isSubmitted = false
      }

      // делаем ререндер extra формы, чтобы отобразить оцененные поля, либо убрать неоцененные
      extraForms.subscribers.forEach(({ visualizeEvalueatedForms }) => {
        visualizeEvalueatedForms()
      })
    },
    setAsDefault(){
      readScheme(scheme, [], {}, (_, name) => {
        // у скрытого поля значения нет: снова показанное, оно начнёт с умолчания компонента
        forms[name].startValue = forms[name].value ?? forms[name].defaultValue
      })

      markClean()
      state.isSubmitted = false
    },
    registry(name, rerenderCb) {
      forms[name].rerender = rerenderCb

      // поле без значения начинает со стартового: так его покажет и снова открытое условие.
      // добавленное поле extraForm — с дефолтного значения компонента: от него считается изменённость убранного поля
      if (forms[name].value === undefined) {
        forms[name].value = extraForms.names[name] ? forms[name].defaultValue : forms[name].startValue
      }

      return {
        unregistry() {
          forms[name].rerender = () => {}
          forms[name].focus = undefined

          if (state.isActive) {
            forms[name].value = undefined
            // ошибка относилась к прежнему значению: снова показанное поле начнет со стартового
            forms[name].error = null

            // при удалении поля из extraForm, должно возникать isDirty состояние,
            // если значение которое в нем хранилось, отличается от дефолтного значение формы.
            // поле скрытого условия не изменено: оно вернется со стартовым значением, а изменение несет поле условия
            const isDirty = extraForms.names[name] ? !isEqual(forms[name].startValue, forms[name].defaultValue) : false

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

      return () => {
        form.subscribers = form.subscribers.filter((o) => o !== observer)
      }
    },
    subscribeToAny(callback) {
      anySubscribers.add(callback)

      return () => {
        anySubscribers.delete(callback)
      }
    },
    getNames() {
      // `forms` уже построен начальным readScheme (включая extra-реестры) и состав ключей не
      // меняется за жизнь менеджера → это и есть полный список dotted-имён полей.
      return Object.keys(forms)
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

      const prevValue = form.value

      // update values
      form.value = value
      form.rerender()

      // trigger subscribers
      form.subscribers.forEach(({ callback }) => {
        callback(value, prevValue)
      })

      // trigger any-change subscribers
      anySubscribers.forEach((callback) => {
        callback()
      })

      // values of the whole form
      changeRef.onChange?.(createValues<Values>(scheme, forms))
    }
  }
}
