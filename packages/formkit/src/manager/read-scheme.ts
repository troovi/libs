import type { Forms } from './manager'
import { FieldValues } from '../types'
import { SchemeItems } from '../core/types'

type cb = (item: SchemeItems.Form, name: string, value?: any) => void
type shownCb = (name: string) => void

// у имён ветки NullableCondition null — отсутствие данных, а не значение поля: поле получит стартовым умолчание
// компонента, как без данных
const omitNulls = (values: FieldValues) => {
  const result: FieldValues = {}

  for (const name in values) {
    if (values[name] !== null) {
      result[name] = values[name]
    }
  }

  return result
}

// prettier-ignore
export const readScheme = (scheme: SchemeItems.All[], path: string[], values: FieldValues, callback: cb) => {
  scheme.forEach((item) => {
    if (item.type === 'form') {
      callback(item, [...path, item.name].join('.'), values[item.name])
    }

    if (item.type === 'context') {
      readScheme(item.childs, [...path, item.context], values[item.context] ?? {}, callback)
      return
    }

    if (item.type === 'layout' || item.type === 'visability') {
      readScheme(item.childs, path, values, callback)
      return
    }

    if (item.type === 'condition') {
      readScheme(item.childs, path, item.nullable ? omitNulls(values) : values, callback)
      return
    }

    if (item.type === 'extra') {
      item.items.forEach(({ getForm, name }) => {
        readScheme([getForm(name, () => {})], path, values, callback)
      })
    }
  })
}

/** Ветка условия показана: по значению его поля, а у условия без поля — по ответу при создании схемы. */
export const isConditionActive = (item: SchemeItems.Condition, forms: Forms) => {
  const value = item.depended === null ? undefined : forms[item.depended]?.value

  return item.canActivate(value)
}

// prettier-ignore
/**
 * Обход полей, которые форма показывает: ветки активных условий и нескрытой visability, добавленные поля
 * extraForm — у них отсутствие значения означает, что поля нет.
 */
export const readShown = (scheme: SchemeItems.All[], path: string[], forms: Forms, callback: shownCb) => {
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

    if (item.type === 'condition' && isConditionActive(item, forms)) {
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
