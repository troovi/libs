export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const getRandomIntString = (n: number) => {
  return new Array(n)
    .fill(0)
    .map(() => getRandomInt(0, 9))
    .join('')
}

export const buildQueryString = (params: object) => {
  if (!params) return ''
  return Object.entries(params).map(stringifyKeyValuePair).join('&')
}

export const stringifyKeyValuePair = ([key, value]: [string, string]) => {
  const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value
  return `${key}=${encodeURIComponent(valueString)}`
}

export const sortObject = (obj: object) => {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, string>>((res, key) => {
      res[key] = obj[key as keyof typeof obj]
      return res
    }, {})
}

export const areArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) {
    return false
  }

  return a.sort().join(',') === b.sort().join(',')
}

export const toArray = <T>(items: T | T[]) => {
  return Array.isArray(items) ? items : [items]
}

export const getTime = (time: number) => {
  return [new Date(time).toLocaleDateString('ru-RU'), new Date(time).toLocaleTimeString('ru-RU')].join(
    ' '
  )
}

export const toNumber = (orders: [string, string][] = []) => {
  return orders.map(([price, quantity]) => [+price, +quantity] as [number, number])
}

export const isEmpthy = (object: object) => {
  return Object.keys(object).length === 0
}
