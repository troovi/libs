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

// prettier-ignore
export const createStaticScope = <T,>(defaultValue: T): [ (props: { children: React.ReactNode; value: T }) => JSX.Element, () => T] => {
  const context = createContext<T>(defaultValue)

  return [
    ({ value, children }) => {
      return <context.Provider value={value}>{children}</context.Provider>
    },
    () => useContext(context)
  ]
}
