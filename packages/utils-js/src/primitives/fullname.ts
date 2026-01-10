import { capitalize } from '../strings'

export interface FullName {
  name: string
  surname: string
  patronymic: string
}

export const isNamesNotEqual = (A: FullName, B: FullName) => {
  return A.name !== B.name || A.surname !== B.surname || A.patronymic !== B.patronymic
}

export const getInitials = ({ name, patronymic }: Omit<FullName, 'surname'>, joinChart = '') => {
  return [capitalize(name[0]), capitalize(patronymic[0])].join(joinChart)
}

export const getShortName = ({ name, surname, patronymic }: FullName) => {
  return `${surname} ${getInitials({ name, patronymic }, '.')}.`
}

export const getFullName = ({ name, surname, patronymic }: FullName) => {
  return `${surname} ${name} ${patronymic}`
}
