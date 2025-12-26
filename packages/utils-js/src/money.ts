export const bigMoneyAmount = (amount: number) => {
  const thousand = amount / 1000

  if (thousand >= 1000) {
    const million = thousand / 1000

    if (million >= 1000) {
      return `${million / 1000} МЛРД. ₽`
    }

    return `${million} МЛН. ₽`
  }

  return `${thousand} ТЫС. ₽`
}

interface CurrencyOptions {
  noPennies?: boolean
}

export const rubles = (num: number, options?: CurrencyOptions) => {
  return num.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    ...(options?.noPennies ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {})
  })
}

export const dollars = (value: number, options?: CurrencyOptions) => {
  return value.toLocaleString('us-US', { style: 'currency', currency: 'USD' })
}
