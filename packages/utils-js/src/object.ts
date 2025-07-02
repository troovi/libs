export const omit = <T extends object>(object: T, key: keyof T) => {
  delete object[key]
  return object
}
