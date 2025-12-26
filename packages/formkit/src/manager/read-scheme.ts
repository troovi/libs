import { FieldValues } from '../types'
import { SchemeItems } from '../core/types'

type cb = (item: SchemeItems.Form, name: string, value?: any) => void

const readScheme = (scheme: SchemeItems.All[], path: string[], values: FieldValues, callback: cb) => {
  scheme.forEach((item) => {
    if (item.type === 'form') {
      callback(item, [...path, item.name].join('.'), values[item.name])
    }

    if (item.type === 'context') {
      readScheme(item.childs, [...path, item.context], values[item.context] ?? {}, callback)
      return
    }

    if (item.type === 'layout' || item.type === 'condition') {
      readScheme(item.childs, path, values, callback)
      return
    }

    if (item.type === 'extra') {
      item.items.forEach(({ getForm, name }) => {
        readScheme([getForm(name, () => {})], path, values, callback)
      })
    }
  })
}

export { readScheme }
