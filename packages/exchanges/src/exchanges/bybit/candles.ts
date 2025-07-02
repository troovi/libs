import { intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { ByBitApi } from './api/api'

export const createByBitSpotChartFormatter = (api: ByBitApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': '1' as const,
        '5m': '5' as const
      }

      const series = await (async () => {
        if (endTime) {
          // fetching series until endTime includes
          return api.getKlines({
            symbol,
            category: 'spot',
            start: +endTime - size * intervals[interval],
            end: +endTime,
            limit: size,
            interval: types[interval]
          })
        }

        // fetching latest data
        return api.getKlines({
          symbol,
          category: 'spot',
          interval: types[interval],
          limit: size
        })
      })()

      return series.reverse()
    }
  })
}

export const createByBitFuturesChartFormatter = (api: ByBitApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': '1' as const,
        '5m': '5' as const
      }

      const series = await (async () => {
        if (endTime) {
          // fetching series until endTime includes
          return api.getKlines({
            symbol,
            category: 'linear',
            start: +endTime - size * intervals[interval],
            end: +endTime,
            limit: size,
            interval: types[interval]
          })
        }

        // fetching latest data
        return api.getKlines({
          symbol,
          category: 'linear',
          interval: types[interval],
          limit: size
        })
      })()

      return series.reverse()
    }
  })
}
