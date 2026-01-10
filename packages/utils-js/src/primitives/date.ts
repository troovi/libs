export interface DateFormat {
  year: number
  month: number
  day: number
}

function getFormat(date: Date): DateFormat
function getFormat(date: Date | null): DateFormat | null
function getFormat(date: Date | null): DateFormat | null {
  if (date) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
  }

  return null
}

function getDate(date: DateFormat): Date
function getDate(date: DateFormat | null): Date | null
function getDate(date: DateFormat | null): Date | null {
  if (date) {
    return new Date(date.year, date.month - 1, date.day)
  }

  return null
}

export const dateFormat = { getDate, getFormat }
