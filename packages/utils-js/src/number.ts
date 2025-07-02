export const getFloatDigits = (value: string) => {
  if (value.includes('e')) {
    const [int, exp] = value.split('e')
    return Math.max((int.split('.')[1]?.length || 0) - +exp, 0)
  }

  return value.split('.')[1]?.length || 0
}

export const truncateNumber = (value: number, precision: number) => {
  const result = value.toFixed(precision)

  // Проверка: округлило ли .toFixed() вверх? Если да — уменьшаем результат вручную
  if (Math.abs(+result) > Math.abs(value)) {
    return (+result - Math.sign(value) * Math.pow(0.1, precision)).toFixed(precision)
  }

  return result
}

export const roundTo = (value: number, precision: number) => {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

export const cutNumber = (value: number, precision: number) => {
  const factor = Math.pow(10, precision)
  return Math.floor(value * factor) / factor
}

export const roundUp = (value: number, precision: number) => {
  const result = value.toFixed(precision)

  if (+result > value) {
    return +result
  }

  if (value > +result) {
    return +result + +getPrecisionStep(precision)
  }

  return +result
}

export const getPrecisionStep = (precision: number, digit: number = 1) => {
  if (precision > 0) {
    return [0, '.', ...new Array(precision - 1).fill(0), digit].join('')
  }

  return '1'
}

export const isValidPrecision = (value: number, precision: number) => {
  const num = value.toString()

  if (num.includes('.')) {
    if (precision === 0) {
      return false
    }

    return num.split('.')[1].length <= precision
  }

  return true
}
