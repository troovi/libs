export const sleep = (time: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

export const stringify = (...ars: any[]) => {
  return ars.map((value) => JSON.stringify(value)).join(' ')
}

export const dollar = (value: number) => {
  return value.toLocaleString('us-US', { style: 'currency', currency: 'USD' })
}

export const contain = <T>(items: T[][]): T[] => {
  return items.reduce((prev, curr) => [...prev, ...curr], [])
}

export const nonNullable = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined
}
