export const delta = (a: number, b: number) => {
  return Math.max(a, b) - Math.min(a, b)
}

export const sum = (values: number[]): number => {
  return values.reduce((prev, curr) => prev + curr, 0)
}

export const avg = (values: number[]): number => {
  if (values.length === 0) {
    return 0
  }

  return sum(values) / values.length
}

export const getMoveChange = (A: number, B: number) => {
  return ((B - A) / A) * 100
}

export const getErrorPercentage = (expected: number, actual: number) => {
  return (Math.abs(expected - actual) / expected) * 100
}
