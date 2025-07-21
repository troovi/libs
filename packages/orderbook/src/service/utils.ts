import { normalize } from '@troovi/utils-js'

export const roundVolume = (value: number) => {
  // Billions
  if (value > 1000000000) {
    return normalize(value / 1000000000, 0) + 'B'
  }

  // Millions
  if (value > 1000000) {
    return normalize(value / 1000000, 2) + 'M'
  }

  // Thousands
  if (value > 1000) {
    return normalize(value / 1000, 2) + 'K'
  }

  return normalize(value, 1) + ''
}
