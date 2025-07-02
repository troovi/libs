import { getCurrentCandleTime, intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { CoinExApi } from './api'

export const createCoinExSpotChartFormatter = (api: CoinExApi) => {
  return createChartFormatter({
    maxFetchSize: 300,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': 60 as const,
        '5m': 300 as const
      }

      endTime = endTime ?? getCurrentCandleTime(Date.now(), interval)

      return api.getSpotChart({
        market: symbol,
        start_time: (+endTime - (size - 1) * intervals[interval]) / 1000,
        end_time: +endTime / 1000,
        interval: types[interval]
      })
    }
  })
}

export const createCoinExFuturesChartFormatter = (api: CoinExApi) => {
  return createChartFormatter({
    maxFetchSize: 300,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': 60 as const,
        '5m': 300 as const
      }

      endTime = endTime ?? getCurrentCandleTime(Date.now(), interval)

      return api.getFuturesChart({
        market: symbol,
        start_time: (+endTime - (size - 1) * intervals[interval]) / 1000,
        end_time: +endTime / 1000,
        interval: types[interval]
      })
    }
  })
}
