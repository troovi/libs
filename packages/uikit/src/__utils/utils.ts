import { DateFormat, Option } from '..'

export const callMultiple =
  (...fns: any[]) =>
  (...args: any[]): void =>
    fns.filter((f) => typeof f === 'function').forEach((f) => f(...args))

export const getActiveElementByAnotherElement = (el: Element | null): Element | null =>
  el ? el.ownerDocument.activeElement : null

export const contains = (parent?: Element | null, child?: Element | null): boolean => {
  return parent && child ? parent.contains(child) : false
}

export const isHTMLElement = (value: any): value is HTMLElement => {
  return value.nodeType === Node.ELEMENT_NODE
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max))

export const getNum = (value: string) => {
  return isNaN(Number(value)) ? null : +value
}

/**
 * Генерирует массив с диапазоном чисел. Взято с VKUI
 */
export const range = (from: number, to: number, step = 1) => {
  const direction = from < to ? 1 : -1
  const distance = Math.abs(from - to) + 1
  const arrayLength = Math.ceil(distance / step)

  const arr = Array<number>(arrayLength)
  for (let index = 0; index < arr.length; index++) {
    arr[index] = from + index * step * direction
  }

  return arr
}

export const getMonthMaxDay = (month: number, year: number) => {
  return new Date(year, month, 0).getDate()
}

export const getFirstDay = (month: number, year: number) => {
  return new Date(year, month - 1, 1).getDay()
}

// 0 is Monday, 6 - is Sunday
export const getDayIndex = (day: number) => {
  return day === 0 ? 6 : day - 1
}

export const createVoids = (length: number) => {
  return new Array(length).fill(0)
}

export const dateToFormat = (date: Date): DateFormat => {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  }
}

export const createDateValidation = ({ min, max }: { min: DateFormat; max: DateFormat }) => {
  return (value: DateFormat) => {
    if (min.year === value.year) {
      if (value.month !== 0 && value.month < min.month) {
        value.month = 0
        value.day = 0

        return value
      }

      if (value.month === min.month && value.day < min.day && value.day !== 0) {
        value.day = 0

        return value
      }
    }

    if (max.year === value.year) {
      if (value.month !== 0 && value.month > max.month) {
        value.month = 0
        value.day = 0

        return value
      }

      if (value.month === max.month && value.day > max.day && value.day !== 0) {
        value.day = 0

        return value
      }
    }
  }
}

export const createRangeValidation = ({ min, max }: { min?: DateFormat; max?: DateFormat }) => {
  const minTime = min ? new Date(formatToDate(min)).getTime() : 0
  const maxTime = max ? new Date(formatToDate(max)).getTime() : Infinity

  const getCurrentTime = (value: DateFormat) => {
    return new Date(formatToDate(value)).getTime()
  }

  return {
    isDateMinValid: (value: DateFormat) => {
      return getCurrentTime(value) > minTime
    },
    isDateMaxValid: (value: DateFormat) => {
      return getCurrentTime(value) < maxTime
    },
    isDateInRange: (value: DateFormat) => {
      const current = getCurrentTime(value)

      return current > minTime && current < maxTime
    }
  }
}

export const formatToDate = (format: DateFormat): Date => {
  return new Date(format.year, format.month - 1, format.day)
}

export const weeks = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const DefaultMonths = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
]

export const DEFAULT_MAX_YEAR = 9999
export const DEFAULT_MIN_YEAR = 100

export const getYears = (currentYear: number, range: number): Option<number>[] => {
  const years: Option<number>[] = []

  const minYear = clamp(currentYear - range, DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR)
  const maxYear = clamp(currentYear + range, DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR)

  for (let i = minYear; i <= maxYear; i++) {
    years.push({ title: String(i).padStart(4, '0'), value: i })
  }

  return years
}

export const getMonths = (locale?: string): Option<number>[] => {
  const months: Option<number>[] = []
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'long'
  })

  for (let i = 0; i < 12; i++) {
    months.push({
      title: formatter.format(new Date(2023, i, 15)),
      value: i
    })
  }

  return months
}
