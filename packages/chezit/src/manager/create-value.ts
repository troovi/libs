import { FieldValues } from '../types'
import { SchemeItems } from '../core/types'
import { Forms } from './manager'

interface Props {
  scheme: SchemeItems.All[]
  path: string[]
  values: FieldValues
  forms: Forms
}

const iterate = ({ scheme, values, path, forms }: Props) => {
  scheme.forEach((item) => {
    if (item.type === 'form') {
      const name = [...path, item.name].join('.')

      if (forms[name].value !== undefined) {
        values[item.name] = forms[name].value
      }
    }

    if (item.type === 'context') {
      values[item.context] = {}

      iterate({
        scheme: item.childs,
        path: [...path, item.context],
        values: values[item.context],
        forms
      })

      return
    }

    if (item.type === 'layout') {
      iterate({ scheme: item.childs, path, values, forms })
      return
    }

    if (item.type === 'condition') {
      const value = forms[item.depended]?.value

      if (item.canActivate(value)) {
        iterate({ scheme: item.childs, path, values, forms })
        return
      }
    }

    if (item.type === 'extra') {
      item.items.forEach(({ getForm, name }) => {
        iterate({ scheme: [getForm(name, () => {})], path, values, forms })
      })
    }
  })
}

export const createValues = <T>(scheme: SchemeItems.All[], forms: Forms) => {
  const values = {}

  iterate({ scheme, path: [], values, forms })

  return values as T
}
