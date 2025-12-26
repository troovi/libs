import { FormContext } from './context'
import { useContext, useEffect, useState } from 'react'

export const useValue = (name: string) => {
  const [, rerender] = useState([])

  const manager = useContext(FormContext)
  const form = manager.getForm(name)

  useEffect(() => {
    const { unsubscribe } = manager.subscribeToForm(name, () => {
      rerender([])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return form?.value
}
