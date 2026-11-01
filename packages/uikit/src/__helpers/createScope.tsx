import { createContext, useContext, useMemo, useState } from 'react'

interface ContextValue<T> {
  value: T
  setValue: React.Dispatch<React.SetStateAction<T>>
}

interface ProviderChildren<T> {
  children: React.ReactNode
  initialValue?: T
}

type Scope<T> = [T, React.Dispatch<React.SetStateAction<T>>]
type ScopeProvider<T> = (props: ProviderChildren<T>) => JSX.Element
type Setter<T> = (value: React.SetStateAction<T>) => void

export const createScope = <T,>(defaultValue: T): [ScopeProvider<T>, () => Scope<T>, Setter<T>] => {
  const context = createContext<ContextValue<T>>({
    value: defaultValue,
    setValue: () => {}
  })

  const store: { setValue: Setter<T> } = { setValue: () => {} }

  const useScope = (): Scope<T> => {
    const { value, setValue } = useContext(context)
    return [value, setValue]
  }

  const Provider: ScopeProvider<T> = ({ initialValue, children }) => {
    const [value, setValue] = useState<T>(initialValue ?? defaultValue)

    useMemo(() => {
      store.setValue = setValue
    }, [])

    return <context.Provider value={{ value, setValue }}>{children}</context.Provider>
  }

  return [Provider, useScope, (value) => store.setValue(value)]
}

/** Значение контекста вне провайдера: по нему хук области узнаёт, что вызван не в ней. */
const OUTSIDE = Symbol('outside')

/**
 * Область с неизменным значением — идентификатор записи, движок экрана. Провайдер — сам `Provider` контекста
 * (`<Scope value={…}>`), без обёртки; хук отдаёт значение и бросает ошибку, если вызван вне провайдера. `name` — имя
 * области в ошибке и в React DevTools.
 */
export const createStaticScope = <T,>(name: string): [React.Provider<T>, () => T] => {
  const context = createContext<T | typeof OUTSIDE>(OUTSIDE)

  context.displayName = name

  const useScope = () => {
    const value = useContext(context)

    if (value === OUTSIDE) {
      throw new Error(`${name}: хук области вызван вне её провайдера`)
    }

    return value
  }

  return [context.Provider as React.Provider<T>, useScope]
}
