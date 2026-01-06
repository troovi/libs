import { useCallback, useState } from 'react'

type SetTrue = () => void
type SetFalse = () => void
type Toggle = () => void

export const useBooleanState = (defaultValue = false): [boolean, SetTrue, SetFalse, Toggle] => {
  const [value, setValue] = useState(defaultValue)

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  const toggle = useCallback(() => {
    setValue((value) => !value)
  }, [])

  return [value, setTrue, setFalse, toggle]
}
