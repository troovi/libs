import { useRef, useMemo, useEffect } from 'react'

import { ExtractValues, ExtractFlatValues } from './core/extract'
import { SchemeBuilder } from './SchemeBuilder'
import { SchemeItems } from './core/types'
import { FormManager, ResetOptions, createFormManager } from './manager/manager'
import { FormContext } from './context'
import { DeepPartial, FieldValues } from './types'
import { useValue } from './useValue'

export type Copy<T> = { [K in keyof T]: T[K] }
export type ChangeEvent<T> = Required<{ [K in keyof T]: { name: K; value: T[K] } }[keyof T]>
export type DirtyEvent<T> = Required<{ [K in keyof T]: { name: K; isDirty: boolean } }[keyof T]>

export type SetError<V> = (name: keyof V, error: { message: string }) => void

export interface SubmitCallbacls<FlattenValues> {
  setError: SetError<FlattenValues>
}

export interface MainOptions<Values extends FieldValues, FlattenValues, ClonedValues> {
  disabled?: boolean
  /**
   * Стартовые значения полей. Поле, которому значения не дали (`undefined`), начинает с умолчания своего
   * компонента. Поле, которое скрыло условие, значение теряет и снова показанным начинает со стартового.
   */
  defaultValues?: DeepPartial<ClonedValues>
  onEqual?: () => void
  /** Поле стало изменённым или снова стартовым — правкой, скрытием, `reset` и `setAsDefault`. */
  onDirty?: (event: DirtyEvent<FlattenValues>) => void
  onChangeEvent?: (event: ChangeEvent<FlattenValues>) => void
  /**
   * Форма стала изменённой (первое изменённое поле) или снова стартовой (последнее изменение снято): правкой полей,
   * `reset` и `setAsDefault`.
   */
  onFormDirty?: (isDirty: boolean) => void
  /**
   * Значения формы после каждого изменения поля — у формы, которая отдаёт значения сразу, без отправки
   * (расчёт поверх полей). Поля скрытых условий в значения не входят, как и при отправке. Поля, которые
   * изменение только что показало, входят сразу, ещё до монтирования, — со стартовым значением.
   */
  onChange?: (values: Values) => void
  /**
   * Отправка после проверки полей; без неё `handleSubmit` только проверяет поля. Проверяются поля, которые форма
   * показывает: поле скрытого условия в отправку не входит, поле скрытой `visability` несёт значение без проверки.
   */
  onSubmit?: (values: Values, callbacks: SubmitCallbacls<FlattenValues>) => Promise<void>
}

export type GetDefaultValues<Items extends SchemeItems.All[]> = DeepPartial<
  ExtractValues<Items[number]>
>

const useDynamicForm = (
  scheme: SchemeItems.All[],
  opts: MainOptions<FieldValues, FieldValues, FieldValues>
) => {
  return useForm(scheme as [], opts)
}

const useForm = <
  Items extends SchemeItems.All[],
  Values extends ExtractValues<Items[number]>,
  FlattenValues extends ExtractFlatValues<Items[number]>,
  Cloned extends Copy<Values>
>(
  scheme: Items,
  opts: MainOptions<Values, FlattenValues, Cloned>
) => {
  const managerRef = useRef<FormManager<Values, FlattenValues, Cloned> | null>(null)

  if (managerRef.current === null) {
    managerRef.current = createFormManager(scheme, opts)
  }

  const manager = managerRef.current

  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.submitRef.onSubmit = opts.onSubmit
      managerRef.current.changeRef.onChange = opts.onChange
    }
  }, [opts.onSubmit, opts.onChange])

  return {
    manager,
    useValue: <K extends keyof FlattenValues>(name: K): FlattenValues[K] => {
      return useValue(name as string)
    },
    reset: (values: DeepPartial<Cloned>, options: ResetOptions = {}) => {
      manager.reset(values, options)
    },
    setAsDefault: () => {
      manager.setAsDefault()
    },
    setFocus: (name: keyof FlattenValues) => {
      manager.setFocus(name)
    },
    setError: (name: keyof FlattenValues, error: { message: string }) => {
      manager.setError(name, error)
    },
    setValue: <K extends keyof FlattenValues>(name: K, value: FlattenValues[K]) => {
      manager.setValue(name, value)
    },
    getValue: <K extends keyof FlattenValues>(name: K & string): FlattenValues[K] => {
      return manager.getForm(name).value
    },
    getValues: () => {
      return manager.getValues()
    },
    handleSubmit: async () => {
      await manager.handleSubmit()
    },
    // тихая проверка: пройдёт ли форма handleSubmit — без ошибок у полей, фокуса и перерисовки
    isValid: () => {
      return manager.isValid()
    },
    // prettier-ignore
    subscribe: <K extends keyof FlattenValues>(name: K & string, callback: (value: FlattenValues[K], prevValue: FlattenValues[K]) => void) => {
      return manager.subscribeToForm(name, callback)
    },
    // подписка на любое изменение значений формы (для гейтов поверх всех полей)
    subscribeAny: (callback: () => void) => {
      return manager.subscribeToAny(callback)
    },
    // плоский список имён всех полей (dotted-пути; вложенные context раскрыты)
    getNames: (): string[] => {
      return manager.getNames()
    }
  }
}

interface Props {
  manager: FormManager<any, any, any>
}

export const FormLayout = ({ manager }: Props) => {
  useMemo(() => {
    manager.activate()
  }, [])

  useEffect(() => {
    return () => {
      manager.disactivate()
    }
  }, [])

  return (
    <FormContext.Provider value={manager}>
      <SchemeBuilder scheme={manager.scheme} path={[]} />
    </FormContext.Provider>
  )
}

export { useForm, useDynamicForm }
