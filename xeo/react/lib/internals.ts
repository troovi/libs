import { MutationEvent } from './types'

export const createEntityProxy = <T extends object>(entity: T, fields: Set<string>) => {
  return new Proxy(entity, {
    get(target, prop, receiver) {
      if (typeof prop === 'string') {
        fields.add(prop)
      }

      return Reflect.get(target, prop, receiver)
    }
  })
}

export const shouldUpdateEntity = (event: MutationEvent, fields: Set<string>) => {
  if (event.type !== 'update' || !event.fields) {
    return true
  }

  return event.fields.some((address) => {
    const topField = address.split('.')[0]

    return fields.has(topField)
  })
}
