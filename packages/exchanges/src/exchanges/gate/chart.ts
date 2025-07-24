import { intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../formatters'
import { GateApi } from './api'
import { ChartApi } from '../../types'

export const createGateChartApi = (api: GateApi): ChartApi => {
  const [spotFormatter, futuresFormatter] = [
    createGateSpotChartFormatter(api),
    createGateSpotChartFormatter(api)
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

export const createGateSpotChartFormatter = (api: GateApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      if (endTime) {
        // fetching series until endTime includes
        return api.getSpotChart({
          currency_pair: symbol,
          from: (+endTime - (size - 1) * intervals[interval]) / 1000,
          to: +endTime / 1000,
          interval
        })
      }

      // fetching latest data
      return api.getSpotChart({
        currency_pair: symbol,
        limit: size,
        interval
      })
    }
  })
}

export const createGateFuturesChartFormatter = (api: GateApi) => {
  return createChartFormatter({
    maxFetchSize: 1000,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      if (endTime) {
        // fetching series until endTime includes
        return api.getFuturesChart({
          contract: symbol,
          from: (+endTime - (size - 1) * intervals[interval]) / 1000,
          to: +endTime / 1000,
          interval
        })
      }

      // fetching latest data
      return api.getFuturesChart({
        contract: symbol,
        limit: size,
        interval
      })
    }
  })
}
