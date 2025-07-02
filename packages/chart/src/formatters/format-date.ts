export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value)
}

export function isInteger(value: unknown): boolean {
  return typeof value === 'number' && value % 1 === 0
}

export function numberToStringWithLeadingZero(value: number, length: number): string {
  if (!isNumber(value)) {
    return 'n/a'
  }

  if (!isInteger(length)) {
    throw new TypeError('invalid length')
  }

  if (length < 0 || length > 16) {
    throw new TypeError('invalid length')
  }

  if (length === 0) {
    return value.toString()
  }

  const dummyString = '0000000000000000'
  return (dummyString + value.toString()).slice(-length)
}

const getMonth = (date: Date) => date.getUTCMonth() + 1
const getDay = (date: Date) => date.getUTCDate()
const getYear = (date: Date) => date.getUTCFullYear()

const dd = (date: Date) => numberToStringWithLeadingZero(getDay(date), 2)
const MMMM = (date: Date, locale: string) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).toLocaleString(locale, { month: 'long' })
const MMM = (date: Date, locale: string) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).toLocaleString(locale, { month: 'short' })
const MM = (date: Date) => numberToStringWithLeadingZero(getMonth(date), 2)
const yy = (date: Date) => numberToStringWithLeadingZero(getYear(date) % 100, 2)
const yyyy = (date: Date) => numberToStringWithLeadingZero(getYear(date), 4)

export function formatDate(date: Date, format: string, locale: string): string {
  return format
    .replace(/yyyy/g, yyyy(date))
    .replace(/yy/g, yy(date))
    .replace(/MMMM/g, MMMM(date, locale))
    .replace(/MMM/g, MMM(date, locale))
    .replace(/MM/g, MM(date))
    .replace(/dd/g, dd(date))
}
