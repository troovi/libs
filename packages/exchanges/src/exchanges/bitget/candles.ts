import { intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { BitgetApi } from './api/api'

export const createBitgetSpotChartFormatter = (api: BitgetApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': '1min' as const,
        '5m': '5min' as const
      }

      if (endTime) {
        return api.getSpotChart({
          symbol,
          granularity: types[interval],
          startTime: +endTime - size * intervals[interval],
          endTime: +endTime,
          limit: size as 1000
        })
      }

      // fetching latest data
      return api.getSpotChart({
        symbol,
        granularity: types[interval],
        limit: size as 1000
      })
    }
  })
}

export const createBitgetFuturesChartFormatter = (api: BitgetApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      if (endTime) {
        return api.getFuturesChart({
          symbol,
          productType: 'usdt-futures',
          granularity: interval,
          startTime: +endTime - size * intervals[interval],
          endTime: +endTime,
          limit: size as 1000
        })
      }

      return api.getFuturesChart({
        symbol,
        productType: 'usdt-futures',
        granularity: interval,
        limit: size as 1000
      })
    }
  })
}
