import { Coordinate, Time } from 'lightweight-charts'

export interface ViewPoint {
  x: Coordinate | null
  y: Coordinate | null
}

export interface Point {
  time: Time
  logical: number
  price: number
}

export const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  seconds %= 86400
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days}d`)
  }

  if (hours > 0) {
    parts.push(`${hours}h`)
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`)
  }

  return parts.join(', ')
}

export const positionsBox = (position1Media: number, position2Media: number, pixelRatio: number) => {
  const scaledPosition1 = Math.round(pixelRatio * position1Media)
  const scaledPosition2 = Math.round(pixelRatio * position2Media)

  return {
    position: Math.min(scaledPosition1, scaledPosition2),
    length: Math.abs(scaledPosition2 - scaledPosition1) + 1
  }
}
