export const applyAlphaToHex = (hex: string, opacity: number) => {
  if (hex.startsWith('#')) {
    hex = hex.slice(1)
  }

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const alpha = Math.max(0, Math.min(100, opacity)) / 100

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const rgbaToHex = (rgba: string) => {
  // Извлекаем значения с помощью регулярного выражения
  const match = rgba.match(/rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)/)

  if (!match) {
    throw new Error('Некорректный формат RGBA')
  }

  const [, r, g, b, a] = match

  const toHex = (n: string) => {
    const hex = parseInt(n).toString(16)
    return hex.padStart(2, '0')
  }

  const alpha = Math.round(parseFloat(a) * 255)

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha.toString())}`
}
