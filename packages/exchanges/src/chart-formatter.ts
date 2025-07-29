import { Candle, intervals } from '@troovi/chart'

export interface ChartOptions {
  symbol: string
  interval: '1m' | '5m'
  size: number
  endTime?: number // если параметр указан, запрос вернет данные по endTime включительно, в противном случае, будут переданы последние данные
}

interface Params {
  maxFetchSize: number
  fetchSeries: ChartFormatter
}

export type ChartFormatter = (params: ChartOptions) => Promise<Candle[]>

export const createChartFormatter = ({ maxFetchSize, fetchSeries }: Params): ChartFormatter => {
  return async ({ size, symbol, endTime, interval }) => {
    if (size > maxFetchSize) {
      const maxLimitCounts = Math.floor(size / maxFetchSize)
      const sizeChunks = new Array<number>(maxLimitCounts).fill(maxFetchSize)
      const remainder = size - maxLimitCounts * maxFetchSize
      const deltaTime = intervals[interval]

      if (remainder !== 0) {
        sizeChunks.push(remainder)
      }

      const latest: Candle[] = []

      if (!endTime) {
        const latestSeries = await fetchSeries({ symbol, size: sizeChunks.shift()!, interval })

        if (latestSeries.length === 0) {
          return []
        }

        latest.push(...latestSeries)
      }

      let prevStartTime = endTime ? endTime + deltaTime : latest[0].time

      const series = await Promise.all(
        sizeChunks.map(async (chunkSize) => {
          const endTime = prevStartTime - deltaTime
          prevStartTime = endTime - (chunkSize - 1) * deltaTime

          return fetchSeries({
            symbol,
            size: chunkSize,
            interval,
            endTime
          })
        })
      )

      return [...series.reverse().reduce((prev, curr) => [...prev, ...curr], []), ...latest]
    }

    return fetchSeries({ symbol, size, interval, endTime })
  }
}
