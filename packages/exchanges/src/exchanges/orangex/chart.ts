import { getCurrentCandleTime, intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../formatters'
import { OrangeXApi } from './api'
import { ChartApi } from '../../types'

export const createOrangeXChartApi = (api: OrangeXApi): ChartApi => {
  const formatter = createChartFormatter({
    maxFetchSize: 500,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      const types = {
        '1m': '1' as const,
        '5m': '5' as const
      }

      const series = await (async () => {
        endTime = endTime ?? getCurrentCandleTime(Date.now(), interval)

        return api.getChart({
          instrument_name: symbol,
          start_timestamp: ((+endTime - (size - 1) * intervals[interval]) / 1000).toString(),
          end_timestamp: (+endTime / 1000).toString(),
          resolution: types[interval]
        })
      })()

      return series
    }
  })

  return (market, params) => {
    return formatter(params)
  }
}
