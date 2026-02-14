import { capitalize } from '../strings'

export interface FullName {
  name: string
  surname: string
  patronymic: string
}

export const isNamesNotEqual = (A: FullName, B: FullName) => {
  return A.name !== B.name || A.surname !== B.surname || A.patronymic !== B.patronymic
}

export const getInitials = (
  { name = '', patronymic = '' }: Omit<FullName, 'surname'>,
  joinChart = ''
) => {
  const chunks: string[] = []

  if (name[0]) {
    chunks.push(capitalize(name[0]))
  }

  if (patronymic[0]) {
    chunks.push(capitalize(patronymic[0]))
  }

  return chunks.join(joinChart)
}

export const getShortName = ({ name, surname, patronymic }: FullName) => {
  return `${surname} ${getInitials({ name, patronymic }, '.')}.`
}

export const getFullName = ({ name, surname, patronymic }: FullName) => {
  return `${surname} ${name} ${patronymic}`
}
