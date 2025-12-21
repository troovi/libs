import { AsyncLocalStorage } from 'node:async_hooks'

export const createContext = <T>() => {
  const storage = new AsyncLocalStorage<T>()

  return {
    provide: (value: T, fn: () => void) => {
      return storage.run(value, fn)
    },
    use: (): T => {
      const store = storage.getStore()

      if (!store) {
        throw new Error('useContext called outside of context')
      }

      return store
    }
  }
}
