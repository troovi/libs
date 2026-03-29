export const keys = (object: object) => {
  return Object.keys(object)
}

export const keysLength = (object: object) => {
  return keys(object).length
}

export const isEmpty = (obj: object) => {
  for (const _ in obj) {
    return false
  }

  return true
}

export const omit = <T extends object>(object: T, key: keyof T) => {
  delete object[key]
  return object
}

export const partial = <T extends object>(object: T): T => {
  const response = {} as T

  for (const key in object) {
    if (object[key]) {
      response[key] = object[key]
    }
  }

  return response
}

export const isObjectLike = (value: unknown): value is object => {
  return typeof value === 'object' && value !== null
}

export const isPlainObject = (value: unknown): value is object => {
  if (isObjectLike(value)) {
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
  }

  return false
}

export const isDraftable = (value: unknown): value is object => {
  return Array.isArray(value) || isPlainObject(value)
}
