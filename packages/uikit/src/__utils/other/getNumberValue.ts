export const getNumberValue = (e: HTMLInputElement) => {
  const value = (e.value as string).trim()

  if (value.startsWith('.') || value.startsWith('0')) {
    return null
  }

  const signs = value.replace('.', '').split('')

  if (signs.some((symbol) => isNaN(parseInt(symbol)))) {
    return null
  }

  return value
}
