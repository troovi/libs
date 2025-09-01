export const omit = <T extends object>(object: T, key: keyof T) => {
  delete object[key]
  return object
}

export const isEmpthy = (object: object) => {
  return Object.keys(object).length === 0
}
