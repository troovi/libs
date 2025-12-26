export const generateCode = (size: number) => {
  const characters = 'A0B1C2D3E4F5G6H7W89K0L1M2N34P5Q6R7S8T9U0V3XYZ' // 33 uniq symbols
  const result: string[] = []

  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result.push(characters[randomIndex])
  }

  return result.join('')
}

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomIntString = (n: number) => {
  return new Array(n)
    .fill(0)
    .map(() => getRandomInt(0, 9))
    .join('')
}

export const hash = () => {
  const d = typeof performance === 'undefined' ? Date.now() : performance.now() * 1000

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16 + d) % 16 | 0

    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface ArrItemOptions<T> {
  exceptions: T[]
  isEqual: (a: T, b: T) => boolean
}

export const getRandomItemFromArray = <T>(values: T[], exception?: ArrItemOptions<T>) => {
  const items = (() => {
    if (exception && exception.exceptions.length < values.length) {
      return values.filter((a) => !exception.exceptions.some((b) => exception.isEqual(a, b)))
    }

    return values
  })()

  return items[(items.length * Math.random()) << 0] as T
}
