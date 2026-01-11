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
  defaultValues?: DeepPartial<ClonedValues>
  onEqual?: () => void
  onDirty?: (event: DirtyEvent<FlattenValues>) => void
  onChangeEvent?: (event: ChangeEvent<FlattenValues>) => void
  onFormDirty?: (isDirty: boolean) => void
  onSubmit: (values: Values, callbacks: SubmitCallbacls<FlattenValues>) => Promise<void>
}

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
    }
  }, [opts.onSubmit])

  return {
    manager,
    useValue: <K extends keyof FlattenValues>(name: K): FlattenValues[K] => {
      return useValue(name as string)
    },
    reset: (values: DeepPartial<Cloned>, options: ResetOptions = {}) => {
      manager.reset(values, options)
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
    getValues: () => {
      return manager.getValues()
    },
    handleSubmit: async () => {
      await manager.handleSubmit()
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
