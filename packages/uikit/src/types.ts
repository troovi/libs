export interface Option<T> {
  title: string
  value: T
  icon?: React.ReactNode
  label?: string
  indicator?: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface DateFormat {
  month: number
  year: number
  day: number
}

export interface TimeFormat {
  hours: number
  minutes: number
}
