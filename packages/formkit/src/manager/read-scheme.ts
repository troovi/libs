import type { Forms } from './manager'
import { FieldValues } from '../types'
import { SchemeItems } from '../core/types'

type cb = (item: SchemeItems.Form, name: string, value?: any) => void
type shownCb = (name: string) => void

const readScheme = (scheme: SchemeItems.All[], path: string[], values: FieldValues, callback: cb) => {
  scheme.forEach((item) => {
    if (item.type === 'form') {
      callback(item, [...path, item.name].join('.'), values[item.name])
    }

    if (item.type === 'context') {
      readScheme(item.childs, [...path, item.context], values[item.context] ?? {}, callback)
      return
    }

    if (item.type === 'layout' || item.type === 'condition' || item.type === 'visability') {
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

/**
 * Обход полей, которые форма показывает: ветки активных условий и нескрытой visability, добавленные поля
 * extraForm — у них отсутствие значения означает, что поля нет.
 */
const readShown = (scheme: SchemeItems.All[], path: string[], forms: Forms, callback: shownCb) => {
  scheme.forEach((item) => {
    if (item.type === 'form') {
      callback([...path, item.name].join('.'))
    }

    if (item.type === 'context') {
      readShown(item.childs, [...path, item.context], forms, callback)
      return
    }

    if (item.type === 'layout') {
      readShown(item.childs, path, forms, callback)
      return
    }

    if (item.type === 'visability' && !item.hidden) {
      readShown(item.childs, path, forms, callback)
      return
    }

    if (item.type === 'condition' && item.canActivate(forms[item.depended]?.value)) {
      readShown(item.childs, path, forms, callback)
      return
    }

    if (item.type === 'extra') {
      item.items.forEach(({ getForm, name }) => {
        if (forms[[...path, name].join('.')]?.value !== undefined) {
          readShown([getForm(name, () => {})], path, forms, callback)
        }
      })
    }
  })
}

export { readScheme, readShown }
