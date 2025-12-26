import { useMemo, useContext, useEffect, useState, useCallback } from 'react'
import { SchemeItems } from './core/types'
import { SchemeBuilder } from './SchemeBuilder'
import { FormContext } from './context'

interface Props {
  path: string[]
  item: SchemeItems.Extra
}

const ExtraScheme = ({ item, path }: Props) => {
  const { getController, items } = item

  const manager = useContext(FormContext)

  const forms = useMemo(() => {
    const data: Record<string, SchemeItems.All> = {}

    items.forEach(({ name, getForm }) => {
      data[name] = getForm(name, () => handleRemove(name))
    })

    return data
  }, [])

  const getVisableNames = useCallback(() => {
    const names: string[] = []

    items.forEach(({ name }) => {
      const form = manager.getForm([...path, name].join('.'))

      if (form.value !== undefined) {
        names.push(name)
      }
    })

    return names
  }, [])

  const defaultVisable = useMemo(() => {
    return getVisableNames()
  }, [])

  const [visable, setVisable] = useState(defaultVisable)

  // registry extra-sheme
  useEffect(() => {
    const { unregistry } = manager.registryExtraForm(
      items.map(({ name }) => [...path, name].join('.')),
      () => {
        setVisable(getVisableNames())
      }
    )

    return () => {
      unregistry()
    }
  }, [])

  const handleAdd = useCallback(
    (name: string) => {
      if (forms[name] && !visable.includes(name)) {
        setVisable((state) => [...state, name])
      }
    },
    [visable]
  )

  const handleRemove = useCallback((name: string) => {
    setVisable((prevState) => {
      return prevState.filter((n) => n !== name)
    })
  }, [])

  return (
    <>
      {visable.map((name) => {
        const source = forms[name]

        return <SchemeBuilder key={`param-form--${name}`} path={path} scheme={[source]} />
      })}
      {getController(handleAdd, visable)}
    </>
  )
}

export { ExtraScheme }
