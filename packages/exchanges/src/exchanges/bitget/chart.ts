import { intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../chart-formatter'
import { BitgetApi } from './api/api'
import { ChartApi } from '../../types'

export const createBitgetChartApi = (api: BitgetApi): ChartApi => {
  const [spotFormatter, futuresFormatter] = [
    createBitgetSpotChartFormatter(api),
    createBitgetFuturesChartFormatter(api)
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

const createBitgetSpotChartFormatter = (api: BitgetApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
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

const createBitgetFuturesChartFormatter = (api: BitgetApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
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
