import { fillMissingCandles, getNextCandleTime, intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { BitMartSpotApi } from './api/spot/api'
import { BitMartFuturesApi } from './api/futures/api'

export const createBitMartSpotChartFormatter = (api: BitMartSpotApi) => {
  return createChartFormatter({
    maxFetchSize: 200,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
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

export const createBitMartFuturesChartFormatter = (api: BitMartFuturesApi) => {
  return createChartFormatter({
    maxFetchSize: 500,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
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
