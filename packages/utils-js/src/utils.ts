export const sleep = async (time: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

export const stringify = (...ars: any[]) => {
  return ars.map((value) => JSON.stringify(value)).join(' ')
}

export const dollar = (value: number) => {
  return value.toLocaleString('us-US', { style: 'currency', currency: 'USD' })
}
