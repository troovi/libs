import { fillMissingCandles, getNextCandleTime, intervals } from '@troovi/chart'
import { ChartOptions, createChartFormatter } from '../../formatters'
import { BitmartSpotApi } from './api/spot/api'
import { BitmartFuturesApi } from './api/futures/api'
import { ChartApi } from '../../types'

export const createBitmartChartApi = (sapi: BitmartSpotApi, fapi: BitmartFuturesApi): ChartApi => {
  const [spotFormatter, futuresFormatter] = [
    createBitmartSpotChartFormatter(sapi),
    createBitmartFuturesChartFormatter(fapi)
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

const createBitmartSpotChartFormatter = (api: BitmartSpotApi) => {
  return createChartFormatter({
    maxFetchSize: 200,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      const types = {
        '1m': 1 as 1,
        '5m': 5 as 5
      }

      const series = await (async () => {
        if (endTime) {
          // fetching series until endTime includes
          return api.getChart({
            symbol,
            after: (+endTime - (size - 1) * intervals[interval]) / 1000,
            before: (+endTime + intervals[interval]) / 1000,
            limit: size as 200,
            step: types[interval]
          })
        }

        // fetching latest data
        return api.getChart({
          symbol,
          step: types[interval],
          limit: size as 200
        })
      })()

      const candles = fillMissingCandles(series, { interval, endTime })

      if (candles.length > size) {
        candles.splice(0, candles.length - size)
      }

      return candles
    }
  })
}

const createBitmartFuturesChartFormatter = (api: BitmartFuturesApi) => {
  return createChartFormatter({
    maxFetchSize: 500,
    async fetchSeries({ symbol, size, interval, endTime }: ChartOptions) {
      const isEndExist = endTime !== undefined

      const types = {
        '1m': 1 as 1,
        '5m': 5 as 5
      }

      endTime = endTime ?? getNextCandleTime(Date.now(), interval)

      const series = await api.getChart({
        symbol,
        start_time: (+endTime - (size - (isEndExist ? 1 : 0)) * intervals[interval]) / 1000,
        end_time: (+endTime + (isEndExist ? intervals[interval] : 0)) / 1000,
        step: types[interval]
      })

      if (series[series.length - 1].time > endTime) {
        series.pop()
      }

      const candles = fillMissingCandles(series, { interval, endTime })

      if (candles.length > size) {
        candles.splice(0, candles.length - size)
      }

      return candles
    }
  })
}
