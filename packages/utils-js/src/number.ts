export const getFloatDigits = (value: string) => {
  if (value.includes('e')) {
    const [int, exp] = value.split('e')
    return Math.max((int.split('.')[1]?.length || 0) - +exp, 0)
  }

  return value.split('.')[1]?.length || 0
}

/**
 * не используйте normalize для округления, когда требуемая точность меньше точности входного значения
 *
 * ❌ normalize(0.000020025, 8) -> 0.00002002
 * ❌ normalize(0.000022025, 8) -> 0.00002203 (!)
 *
 * использование normalize безопасно в случаях нормализации значения: normalize(a + b, precision), если a и b с точностью precision
 *
 * ✅ normalize(0.000020025, 9) -> 0.000020025
 * ✅ normalize(0.000022025, 9) -> 0.000022025
 *
 * 0.1 + 0.2 -> 0.30000000000000004 (10^1) -> 3.0000000000000004 -> (round) 3
 * 0.0001 + 0.0003 -> 0.00039999999999999996 -> (10^4) -> 3.9999999999999996 -> (round) 4
 *
 *  работает корректно до precision <= 22. После: 123 / (10 ** 23) -> 1.2300000000000002e-21
 */

export const normalize = (value: number, precision: number) => {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor // 0.000020025 * 10^8 -> 2002.4999999999998
}

export const cutNumber = (value: number, precision: number) => {
  const factor = Math.pow(10, precision)
  return Math.floor(value * factor) / factor
}

export const roundUp2 = (value: number, precision: number) => {
  const result = value.toFixed(precision)

  if (value > +result) {
    return normalize(+result + +getPrecisionStep(precision), precision)
  }

  return +result
}

export const truncateNumber = (value: number, precision: number) => {
  const result = value.toFixed(precision)

  if (+result > value) {
    return (+result - Math.sign(value) * Math.pow(0.1, precision)).toFixed(precision)
  }

  return result
}

export const getPrecisionStep = (precision: number, digit: number = 1) => {
  if (precision > 0) {
    return [0, '.', ...new Array(precision - 1).fill(0), digit].join('')
  }

  return `${digit}`
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
