import { MexcSpotApi } from './api/spot/api'
import { MexcHandlers } from './api/api-handlers'
import { getCurrentCandleTime, intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { MexcFuturesApi } from './api/futures/api'

export const createMexcSpotChartFormatter = (api: MexcSpotApi) => {
  return createChartFormatter({
    maxFetchSize: 500,
    fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      if (endTime) {
        // fetching series until endTime includes
        return MexcHandlers.infitityTry(() => {
          return api.getChart({
            symbol,
            startTime: +endTime - (size - 1) * intervals[interval],
            endTime: +endTime + intervals[interval],
            limit: size as 500,
            interval
          })
        })
      }

      // fetching latest data
      return api.getChart({ symbol, interval, limit: size as 500 })
    }
  })
}

export const createMexcFuturesChartFormatter = (api: MexcFuturesApi) => {
  return createChartFormatter({
    maxFetchSize: 2000,
    fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': 'Min1' as const,
        '5m': 'Min5' as const
      }

      endTime = endTime ?? getCurrentCandleTime(Date.now(), interval)

      return api.getChart({
        symbol,
        interval: types[interval],
        start: (+endTime - (size - 1) * intervals[interval]) / 1000,
        end: +endTime / 1000
      })
    }
  })
}
