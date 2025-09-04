import { useCallback, useContext, useEffect, useState, useMemo } from 'react'

import { SchemeItems } from './core/types'
import { FormContext } from './context'

interface FormProps {
  name: string
  item: SchemeItems.Form
}

export const Form = ({ item: { Form: TargetForm }, name }: FormProps) => {
  const [, rerender] = useState([])

  const manager = useContext(FormContext)

  const { unregistry } = useMemo(() => {
    return manager.registry(name, () => {
      rerender([])
    })
  }, [])

  const ref = useCallback(
    (element: any) => {
      if (element && element.focus) {
        const state = manager.getForm(name)

        state.focus = () => {
          element.focus()
        }
      }
    },
    [name]
  )

  useEffect(() => {
    return () => {
      unregistry()
    }
  }, [])

  const { value, error } = manager.getForm(name)

  // console.log('render', name, { value })

  return (
    <TargetForm
      field={{
        value,
        onChange: (value) => {
          manager.onChange(name, value)
        },
        onBlur: () => {
          //
        },
        ref
      }}
      isDirty={false}
      error={error}
      disabled={manager.disabled}
    />
  )
}
