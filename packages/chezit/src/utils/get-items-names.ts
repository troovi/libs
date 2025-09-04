import { SchemeItems } from '../core/types'

// NOT DEEP
export const getItemsNames = (path: string[], items: SchemeItems.All[]) => {
  const names: string[] = []

  items.forEach((item) => {
    if (item.type === 'form') {
      names.push([...path, item.name].join('.'))
    }

    if (item.type === 'context') {
      names.push([...path, item.context].join('.'))
    }

    if (item.type === 'layout') {
      names.push(...getItemsNames(path, item.childs))
    }
  })

  return names
}
