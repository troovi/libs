// prettier-ignore

export const regex = {
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  numbers: /^[0-9]+$/
}

export const checkPattern = {
  email: (value: string) => regex.email.test(value),
  numbers: (value: string) => regex.numbers.test(value)
}
