import { intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../chart-formatter'
import { ByBitApi } from './api/api'
import { ChartApi } from '../../types'

export const createByBitChartApi = (api: ByBitApi): ChartApi => {
  const [spotFormatter, futuresFormatter] = [
    createByBitChartFormatter(api, 'spot'),
    createByBitChartFormatter(api, 'linear')
  ]

  return (market, params) => {
    if (market === 'spot') {
      return spotFormatter(params)
    }

    if (market === 'futures') {
      return futuresFormatter(params)
    }

    throw {}
  }
}

const createByBitChartFormatter = (api: ByBitApi, market: 'spot' | 'linear') => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      const types = {
        '1m': '1' as const,
        '5m': '5' as const
      }

      const series = await (async () => {
        if (endTime) {
          // fetching series until endTime includes
          return api.getKlines({
            symbol,
            category: market,
            start: +endTime - size * intervals[interval],
            end: +endTime,
            limit: size,
            interval: types[interval]
          })
        }

        // fetching latest data
        return api.getKlines({
          symbol,
          category: market,
          interval: types[interval],
          limit: size
        })
      })()

      return series.reverse()
    }
  })
}
