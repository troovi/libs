import { useRef, useMemo, useEffect } from 'react'

import { ExtractValues, ExtractFlatValues } from './core/extract'
import { SchemeBuilder } from './SchemeBuilder'
import { SchemeItems } from './core/types'
import { FormManager, createFormManager } from './manager/manager'
import { FormContext } from './context'
import { DeepPartial, FieldValues } from './types'

export type Copy<T> = { [K in keyof T]: T[K] }
export type ChangeEvent<T> = Required<{ [K in keyof T]: { name: K; value: T[K] } }[keyof T]>
export type DirtyEvent<T> = Required<{ [K in keyof T]: { name: K; isDirty: boolean } }[keyof T]>

export type SetError<V> = (name: keyof V, error: { message: string }) => void

export interface MainOptions<Values extends FieldValues, FlattenValues, ClonedValues> {
  disabled?: boolean
  defaultValues?: DeepPartial<ClonedValues>
  onEqual?: () => void
  onDirty?: (event: DirtyEvent<FlattenValues>) => void
  onChangeEvent?: (event: ChangeEvent<FlattenValues>) => void
  onFormDirty?: (isDirty: boolean) => void
  onSubmit: (values: Values, { setError }: { setError: SetError<FlattenValues> }) => Promise<void>
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
  const managerRef = useRef<FormManager<FlattenValues, Cloned> | null>(null)

  if (managerRef.current === null) {
    managerRef.current = createFormManager(scheme, opts)
  }

  const manager = managerRef.current

  return {
    reset: (values: DeepPartial<Cloned>) => {
      manager.reset(values)
    },
    setFocus: (name: keyof FlattenValues) => {
      manager.setFocus(name)
    },
    setError: (name: keyof FlattenValues, error: { message: string }) => {
      manager.setError(name, error)
    },
    getValues: () => {
      return manager.getValues()
    },
    handleSubmit: async () => {
      await manager.handleSubmit()
    },
    Form: <FormScheme manager={manager} scheme={scheme} />
  }
}

interface Props {
  scheme: SchemeItems.All[]
  manager: FormManager<any, any>
}

const FormScheme = ({ manager, scheme }: Props) => {
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
      <SchemeBuilder scheme={scheme} path={[]} />
    </FormContext.Provider>
  )
}

export { useForm, useDynamicForm }
