import { FieldValues } from '../types'
import { SchemeItems } from '../core/types'
import { Forms } from './manager'

interface Props {
  scheme: SchemeItems.All[]
  path: string[]
  values: FieldValues
  forms: Forms
  /**
   * Ветка показана: поле без значения (условие только что открыло его, и оно ещё не смонтировано) отдаёт
   * стартовое значение, с которым смонтируется. Поля скрытой visability и extraForm без значения в значения
   * не входят: у них отсутствие значения означает, что поля нет.
   */
  shown: boolean
}

const iterate = ({ scheme, values, path, forms, shown }: Props) => {
  scheme.forEach((item) => {
    if (item.type === 'form') {
      const { value, startValue } = forms[[...path, item.name].join('.')]

      if (value !== undefined) {
        values[item.name] = value
      }

      if (value === undefined && shown) {
        values[item.name] = startValue
      }
    }

    if (item.type === 'context') {
      values[item.context] = {}

      iterate({
        scheme: item.childs,
        path: [...path, item.context],
        values: values[item.context],
        forms,
        shown
      })

      return
    }

    if (item.type === 'layout') {
      iterate({ scheme: item.childs, path, values, forms, shown })
      return
    }

    if (item.type === 'visability') {
      iterate({ scheme: item.childs, path, values, forms, shown: shown && !item.hidden })
      return
    }

    if (item.type === 'condition') {
      const value = forms[item.depended]?.value

      if (item.canActivate(value)) {
        iterate({ scheme: item.childs, path, values, forms, shown })
        return
      }
    }

    if (item.type === 'extra') {
      item.items.forEach(({ getForm, name }) => {
        iterate({ scheme: [getForm(name, () => {})], path, values, forms, shown: false })
      })
    }
  })
}

export const createValues = <T>(scheme: SchemeItems.All[], forms: Forms) => {
  const values = {}

  iterate({ scheme, path: [], values, forms, shown: true })

  return values as T
}
