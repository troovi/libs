/**
 * Генерирует массив с диапазоном чисел. Взято с VKUI
 */
export const range = (from: number, to: number, step = 1) => {
  const direction = from < to ? 1 : -1
  const distance = Math.abs(from - to) + 1
  const arrayLength = Math.ceil(distance / step)

  const arr = Array<number>(arrayLength)
  for (let index = 0; index < arr.length; index++) {
    arr[index] = from + index * step * direction
  }

  return arr
}

export const splitByChunks = <T>(items: T[], chunkSize: number): T[][] => {
  const result: T[][] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize))
  }

  return result
}

export const separateArray = <T>(array: T[], parts: number): T[][] => {
  if (parts <= 0) throw new Error('Number of parts must be greater than 0')

  const result: T[][] = []
  const partSize = Math.floor(array.length / parts)
  let remainder = array.length % parts
  let start = 0

  for (let i = 0; i < parts; i++) {
    // Распределяем остаток по первым частям
    const extra = remainder > 0 ? 1 : 0
    const end = start + partSize + extra
    const data = array.slice(start, end)

    if (data.length > 0) {
      result.push(data)
    }

    start = end
    remainder--
  }

  return result
}

export const roundSeparateArray = <T>(array: T[], size: number): T[][] => {
  const n = Math.round(array.length / size)
  return n > 1 ? separateArray(array, n) : [array]
}

export const contain = <T>(items: T[][]): T[] => {
  return items.reduce((prev, curr) => [...prev, ...curr], [])
}
