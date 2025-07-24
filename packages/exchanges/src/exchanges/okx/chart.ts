import { intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../formatters'
import { OKXApi } from './api'

import { ChartApi } from '../../types'

export const createOKXChartApi = (api: OKXApi): ChartApi => {
  const formatter = createChartFormatter({
    maxFetchSize: 100,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      const series = await (async () => {
        if (endTime) {
          // fetching series until endTime includes
          return api.getChart({
            instId: symbol,
            before: (+endTime - size * intervals[interval]).toString(),
            after: (+endTime + intervals[interval]).toString(),
            limit: size as 100,
            bar: interval
          })
        }

        // fetching latest data
        return api.getChart({
          instId: symbol,
          bar: interval,
          limit: size as 100
        })
      })()

      return series.reverse()
    }
  })

  return (market, params) => {
    return formatter(params)
  }
}
