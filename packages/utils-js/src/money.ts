export const cashAmount = (amount: number) => {
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
  currency: string
  locale: Intl.LocalesArgument
  noPennies?: boolean
}

const getCurrency = (value: number, { noPennies, currency, locale }: CurrencyOptions) => {
  return value.toLocaleString(locale, {
    style: 'currency',
    currency,
    ...(noPennies ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {})
  })
}

// export const currency = (options: Pick<CurrencyOptions, 'noPennies'> = {}) => {
//   return {
//     rubles: (value: number) => {
//       return getCurrency(value, { locale: 'ru-RU', currency: 'RUB', ...options })
//     },
//     dollars: (value: number) => {
//       return getCurrency(value, { locale: 'us-US', currency: 'USD', ...options })
//     }
//   }
// }

export const rubles = (value: number, options: Pick<CurrencyOptions, 'noPennies'> = {}) => {
  return getCurrency(value, { locale: 'ru-RU', currency: 'RUB', ...options })
}

export const dollars = (value: number, options: Pick<CurrencyOptions, 'noPennies'> = {}) => {
  return getCurrency(value, { locale: 'us-US', currency: 'USD', ...options })
}
