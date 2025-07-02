import { intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { BinanceSpotApi } from './api/spot/api'
import { BinanceFuturesApi } from './api/futures/api'

export const createBinanceSpotChartFormatter = (api: BinanceSpotApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      if (endTime) {
        // fetching series until endTime includes
        return api.getChart({
          symbol,
          startTime: +endTime - (size - 1) * intervals[interval],
          endTime: +endTime + intervals[interval],
          limit: size as 1000,
          interval
        })
      }

      // fetching latest data
      return api.getChart({
        symbol,
        interval,
        limit: size as 1000
      })
    }
  })
}

export const createBinanceFuturesChartFormatter = (api: BinanceFuturesApi) => {
  return createChartFormatter({
    maxFetchSize: 1500,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      if (endTime) {
        // fetching series until endTime includes
        return api.getChart({
          symbol,
          startTime: +endTime - (size - 1) * intervals[interval],
          endTime: +endTime + intervals[interval],
          limit: size as 1500,
          interval
        })
      }

      // fetching latest data
      return api.getChart({
        symbol,
        interval,
        limit: size as 1500
      })
    }
  })
}
