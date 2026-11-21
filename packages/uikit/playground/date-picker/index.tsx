import { DatePicker, DatePickerProps } from '@/DatePicker'
import { FormGroup } from '@/FormGroup'
import { Icon } from '@/Icon'
import { faCalendar } from '@companix/icons-solid'
import { getNoun } from '@companix/utils-js'
import { useState } from 'react'

export const DatePickerExample = () => {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex items-center gap-40">
        <div style={{ width: '340px' }}>
          <DatePickerControl size="md" />
        </div>
        <div style={{ width: '340px' }}>
          <DatePickerControl size="md" showNeighboringMonth disablePickers />
        </div>
        <div style={{ width: '340px' }}>
          <DatePickerControl size="md" native />
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-40">
        <FormGroup label="Срок сдачи" caption="aside — функция от выбранной даты">
          <div style={{ width: '340px' }}>
            <AsideDatePicker aside={(date) => date && <DaysLeft date={date} />} />
          </div>
        </FormGroup>
        <FormGroup label="Дата рождения" caption="Возраст на сегодня">
          <div style={{ width: '340px' }}>
            <AsideDatePicker
              disableFuture
              initial={new Date(1992, 4, 17)}
              aside={(date) => date && <Age birthday={date} />}
            />
          </div>
        </FormGroup>
        <FormGroup label="Выезд" caption="Любой узел: день недели плашкой">
          <div style={{ width: '340px' }}>
            <AsideDatePicker aside={(date) => date && <Weekday date={date} />} />
          </div>
        </FormGroup>
      </div>
      <div className="flex flex-wrap items-start gap-40">
        <FormGroup label="size sm" caption="Подпись мельче поля на 2px">
          <div style={{ width: '340px' }}>
            <AsideDatePicker size="sm" aside={(date) => date && <DaysLeft date={date} />} />
          </div>
        </FormGroup>
        <FormGroup label="size lg">
          <div style={{ width: '340px' }}>
            <AsideDatePicker size="lg" aside={(date) => date && <DaysLeft date={date} />} />
          </div>
        </FormGroup>
        <FormGroup label="native" caption="Нативное поле даты">
          <div style={{ width: '340px' }}>
            <AsideDatePicker native aside={(date) => date && <DaysLeft date={date} />} />
          </div>
        </FormGroup>
      </div>
    </div>
  )
}

interface AsideDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  initial?: Date | null
}

const AsideDatePicker = ({ initial = addDays(new Date(), 5), ...props }: AsideDatePickerProps) => {
  const [value, onChange] = useState<Date | null>(initial)

  return (
    <DatePicker
      fill
      clearButton
      placeholder="Укажите дату"
      leftElement={<Icon icon={faCalendar} size="xxs" className="form-space-margin" />}
      {...props}
      value={value}
      onChange={onChange}
    />
  )
}

/** Сколько дней от сегодня до даты: «через 5 дней», «завтра», просроченная — красным. */
const DaysLeft = ({ date }: { date: Date }) => {
  const days = daysFromToday(date)

  if (days === 0) return <span className="date-aside-today">сегодня</span>
  if (days === 1) return <>завтра</>
  if (days === -1) return <span className="date-aside-overdue">вчера</span>

  const count = `${Math.abs(days)} ${getNoun(days, 'день', 'дня', 'дней')}`

  if (days > 0) {
    return <>через {count}</>
  }

  return <span className="date-aside-overdue">{count} назад</span>
}

const Age = ({ birthday }: { birthday: Date }) => {
  const now = new Date()
  const hadBirthday =
    now.getMonth() > birthday.getMonth() ||
    (now.getMonth() === birthday.getMonth() && now.getDate() >= birthday.getDate())
  const age = now.getFullYear() - birthday.getFullYear() - (hadBirthday ? 0 : 1)

  return (
    <>
      {age} {getNoun(age, 'год', 'года', 'лет')}
    </>
  )
}

const Weekday = ({ date }: { date: Date }) => {
  const weekend = date.getDay() === 0 || date.getDay() === 6

  return (
    <span className="date-aside-weekday" data-weekend={weekend || undefined}>
      {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
    </span>
  )
}

const DAY = 24 * 60 * 60 * 1000

/** Разница в календарных днях: обе даты сводятся к полуночи, округление сглаживает переход на летнее время. */
const daysFromToday = (date: Date) => {
  const today = new Date()
  const day = new Date(date)

  today.setHours(0, 0, 0, 0)
  day.setHours(0, 0, 0, 0)

  return Math.round((day.getTime() - today.getTime()) / DAY)
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)

  next.setDate(next.getDate() + days)
  next.setHours(0, 0, 0, 0)

  return next
}

interface Props {
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  native?: boolean
  showNeighboringMonth?: boolean
  disablePickers?: boolean
}

export const DatePickerControl = (props: Props) => {
  const { size, disabled, required, native, showNeighboringMonth, disablePickers } = props
  const [value, onChange] = useState<null | Date>(new Date())

  console.log(value)
  console.log(value?.toISOString())
  console.log('')

  return (
    <DatePicker
      fill
      clearButton
      leftElement={<Icon icon={faCalendar} size="xxs" className="form-space-margin" />}
      value={value}
      size={size}
      onChange={onChange}
      disabled={disabled}
      required={required}
      placeholder="Укажите дату"
      disableFuture
      native={native}
      showNeighboringMonth={showNeighboringMonth}
      disablePickers={disablePickers}
    />
  )
}
