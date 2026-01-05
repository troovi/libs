export const formatTime = (value: number) => {
  return value.toString().padStart(2, '0')
}

export const getTimes = (ms: number) => {
  if (ms < 0) {
    ms = 0
  }

  const totalSeconds = Math.floor(ms / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds }
}

interface Options {
  utc?: boolean
}

export const getTime = (timestamp: number, { utc }: Options = {}) => {
  const date = new Date(timestamp)
  const prefix = utc ? 'UTC' : ''

  const values = [formatTime(date[`get${prefix}Hours`]()), formatTime(date[`get${prefix}Minutes`]())]

  return values.join(':')
}

export const getDate = (timestamp: number, { utc }: Options = {}) => {
  const date = new Date(timestamp)
  const prefix = utc ? 'UTC' : ''

  const values = [
    formatTime(date[`get${prefix}Date`]()),
    formatTime(date[`get${prefix}Month`]() + 1),
    formatTime(date[`get${prefix}FullYear`]())
  ]

  return values.join('.')
}

export const getDateTime = (timestamp: number, options: Options = {}) => {
  return [getDate(timestamp, options), getTime(timestamp, options)].join(' ')
}

// export const timeDuration = (ms: number) => {
//   const hours = Math.floor(ms / (1000 * 60 * 60))
//   const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
//   const seconds = Math.floor((ms % (1000 * 60)) / 1000)
//   const milliseconds = ms % 1000

//   const parts: string[] = []

//   if (hours > 0) {
//     parts.push(`${hours} h.`)
//   }

//   if (minutes > 0) {
//     parts.push(`${minutes} m.`)
//   }

//   if (parts.length !== 2 && seconds > 0) {
//     parts.push(`${seconds} s.`)
//   }

//   if (parts.length === 0) {
//     parts.push(`${milliseconds} ms`)
//   }

//   return parts.join(' ')
// }
