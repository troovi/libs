export interface Option<T> {
  title: string
  value: T
  icon?: React.ReactNode
  label?: string
  disabled?: boolean
  className?: string
}

export interface DateFormat {
  month: number
  year: number
  day: number
}
