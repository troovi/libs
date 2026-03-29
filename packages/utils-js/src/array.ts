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

function splitByChunks(items: string, chunkSize: number): string[]
function splitByChunks<T>(items: T[], chunkSize: number): T[][]
function splitByChunks<T>(items: T[] | string, chunkSize: number): T[][] | T[] {
  const result: unknown[] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize))
  }

  return result as T[]
}

export { splitByChunks }

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

interface Options<C, P> {
  getCommonKey: (value: C | P) => string
  isChanged: (prev: P, curr: C) => boolean
}

const getArrayCommits = <P, C>(prev: P[], curr: C[], { getCommonKey, isChanged }: Options<C, P>) => {
  const removed: P[] = []
  const updated: { prev: P; curr: C }[] = []
  const unchanged: P[] = []
  const added: C[] = []

  const prevMap: { [key: string]: P } = {}
  const currMap: { [key: string]: C } = {}

  for (const item of prev) {
    prevMap[getCommonKey(item)] = item
  }

  for (const item of curr) {
    currMap[getCommonKey(item)] = item
  }

  for (const prevItem of prev) {
    const currItem = currMap[getCommonKey(prevItem)]

    if (currItem) {
      if (isChanged(prevItem, currItem)) {
        updated.push({ prev: prevItem, curr: currItem })
      } else {
        unchanged.push(prevItem)
      }
    } else {
      removed.push(prevItem)
    }
  }

  for (const currItem of curr) {
    if (!prevMap[getCommonKey(currItem)]) {
      added.push(currItem)
    }
  }

  return {
    removed,
    added: added as C[],
    updated,
    unchanged
  }
}

export { getArrayCommits }
