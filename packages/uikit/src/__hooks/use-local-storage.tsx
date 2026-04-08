import { EventEmmiter } from '@companix/utils-js'
import { useState, useEffect, createContext, useContext, useRef } from 'react'

const LocalStorageContext = createContext({} as LocalStorageService<unknown>)

export class LocalStorageService<T> {
  constructor(public emmiter: EventEmmiter<T>) {}

  getStorageValue(token: string, defaultValue: T) {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    const storageValue = localStorage.getItem(token)

    if (storageValue) {
      return JSON.parse(storageValue)
    }

    return defaultValue
  }

  setValue(token: string, value: T) {
    localStorage.setItem(token, JSON.stringify(value))
    this.emmiter.emit(token, value)
  }
}

export const useLocalStorage = <T,>(token: string, defaultValue: T) => {
  const service = useContext(LocalStorageContext)

  const [state, setState] = useState<T>(() => {
    return service.getStorageValue(token, defaultValue)
  })

  useEffect(() => {
    setState(service.getStorageValue(token, defaultValue))
  }, [token])

  const handleSet = (value: T) => {
    service.setValue(token, value)
  }

  useEffect(() => {
    const unsubscribe = service.emmiter.subscribe(token, (data) => {
      setState(data as T)
    })

    return () => {
      unsubscribe()
    }
  }, [token])

  return [state, handleSet] as const
}

interface LocalStorageProviderProps {
  children: React.ReactNode
}

export const LocalStorageProvider = ({ children }: LocalStorageProviderProps) => {
  const emitterRef = useRef(new LocalStorageService(new EventEmmiter()))

  useEffect(() => {
    if (!window || !emitterRef.current) {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && emitterRef.current.emmiter.store[event.key]) {
        if (event.newValue) {
          emitterRef.current.emmiter.emit(event.key, JSON.parse(event.newValue))
        }
      }
    }

    // Событие вызывается только в других вкладках / окнах / iframe того же origin, когда происходит изменение localStorage или sessionStorage.
    // storage не вызовется в этой же вкладке. storage — механизм синхронизации между контекстами
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  return (
    <LocalStorageContext.Provider value={emitterRef.current}>{children}</LocalStorageContext.Provider>
  )
}
