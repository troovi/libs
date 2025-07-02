export const generateCode = (size: number) => {
  const characters = 'A0B1C2D3E4F5G6H7W89K0L1M2N34P5Q6R7S8T9U0V3XYZ' // 33 uniq symbols

  const result: string[] = []

  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result.push(characters[randomIndex])
  }

  return result.join('')
}

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const hash = () => {
  const d = typeof performance === 'undefined' ? Date.now() : performance.now() * 1000

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16 + d) % 16 | 0

    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
