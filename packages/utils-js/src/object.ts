export const isEmpthy = (object: object) => {
  return Object.keys(object).length === 0
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
