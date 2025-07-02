import { useState, useEffect } from 'react'

export const useLocalStorage = <T>(token: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const initialValue = localStorage.getItem(token)

    if (initialValue) {
      return JSON.parse(initialValue)
    }

    return defaultValue
  })

  useEffect(() => {
    localStorage.setItem(token, JSON.stringify(state))
  }, [state])

  return [state, setState] as [T, React.Dispatch<React.SetStateAction<T>>]
}
