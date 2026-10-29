import { FormContext } from './context'
import { useContext, useEffect, useMemo, useState } from 'react'
import { SchemeItems } from './core/types'
import { ExtractFlatValues } from './core/extract'

export const useValue = <T = any>(name: string): T => {
  const [, rerender] = useState([])
  const manager = useContext(FormContext)

  if (!manager) {
    throw new Error('useValue cannot be used outside Form context')
  }

  const form = useMemo(() => {
    const form = manager.getForm(name)

    if (!form) {
      throw new Error(`form with name "${name}" doesnt exist in form`)
    }

    return form
  }, [manager, name])

  useEffect(() => {
    const unsubscribe = manager.subscribeToForm(name, () => {
      rerender([])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return form.value
}

/**
 * Запись значения поля изнутри формы — из раскладки или компонента схемы, которые сами полем не являются:
 * подстановка значения у подписи, выбор, заполняющий несколько полей. Имя — полный путь поля (`contact.name`).
 */
export const useSetValue = <T = any>(name: string) => {
  const manager = useContext(FormContext)

  if (!manager) {
    throw new Error('useSetValue cannot be used outside Form context')
  }

  return (value: T) => {
    manager.setValue(name, value)
  }
}

// prettier-ignore
export const createUseValue = <Items extends SchemeItems.All[]>() => {
  return <FlattenValues extends ExtractFlatValues<Items[number]>, K extends keyof FlattenValues>(name: K & string): FlattenValues[K] => {
    return useValue(name)
  }
}
