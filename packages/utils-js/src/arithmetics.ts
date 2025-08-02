import Big from 'big.js'

export const big = (n: number) => new Big(n)

export const minus = (a: number, b: number) => {
  return operators.minus(big(a), big(b)).toNumber()
}

export const plus = (a: number, b: number) => {
  return operators.plus(big(a), big(b)).toNumber()
}

export const multiply = (a: number, b: number) => {
  try {
    return operators.multiply(big(a), big(b)).toNumber()
  } catch (e) {
    console.log({ a, b })
    throw e
  }
}

export const devide = (a: number, b: number) => {
  return operators.devide(big(a), big(b)).toNumber()
}

export const increese = <T, K extends keyof T>(source: Record<K, number>, key: K, value: number) => {
  source[key] = plus(source[key], value)
}

export const decreese = <T, K extends keyof T>(source: Record<K, number>, key: K, value: number) => {
  source[key] = minus(source[key], value)
}

export const operators = {
  devide: (a: Big.Big, b: Big.Big) => {
    return a.div(b)
  },
  minus: (a: Big.Big, b: Big.Big) => {
    return a.minus(b)
  },
  plus: (a: Big.Big, b: Big.Big) => {
    return a.plus(b)
  },
  multiply: (a: Big.Big, b: Big.Big) => {
    return a.mul(b)
  }
}
