export const sleep = (time: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

export const nonNullable = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined
}
