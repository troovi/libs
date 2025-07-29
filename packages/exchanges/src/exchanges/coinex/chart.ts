import { getCurrentCandleTime, intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../chart-formatter'
import { CoinExApi } from './api'
import { ChartApi } from '../../types'

export const createCoinExChartApi = (api: CoinExApi): ChartApi => {
  const [spotFormatter, futuresFormatter] = [
    createCoinExSpotChartFormatter(api),
    createCoinExFuturesChartFormatter(api)
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

const createCoinExSpotChartFormatter = (api: CoinExApi) => {
  return createChartFormatter({
    maxFetchSize: 300,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
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

const createCoinExFuturesChartFormatter = (api: CoinExApi) => {
  return createChartFormatter({
    maxFetchSize: 300,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
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
