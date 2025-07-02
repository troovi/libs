import { KuCoinSpotApi } from './api/spot/api'
import { fillMissingCandles, getCurrentCandleTime, getNextCandleTime, intervals } from '@troovi/chart'
import { CandlesParams, createChartFormatter } from '../../formatters'
import { KuCoinFuturesApi } from './api/futures/api'

export const createKuCoinSpotChartFormatter = (api: KuCoinSpotApi) => {
  return createChartFormatter({
    maxFetchSize: 1500,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': '1min' as const,
        '5m': '5min' as const
      }

      endTime = endTime ?? getCurrentCandleTime(Date.now(), interval)

      const series = await api.getChart({
        symbol,
        startAt: (endTime - (size - 1) * intervals[interval]) / 1000,
        endAt: (endTime + intervals[interval]) / 1000,
        type: types[interval]
      })

      const items = series.reverse()

      const candles = fillMissingCandles(items, { interval, endTime })

      if (candles.length > size) {
        candles.splice(0, candles.length - size)
      }

      return candles
    }
  })
}

export const createKuCoinFuturesChartFormatter = (api: KuCoinFuturesApi) => {
  return createChartFormatter({
    maxFetchSize: 200,
    async fetchSeries({ symbol, size, interval, endTime }: CandlesParams) {
      const types = {
        '1m': 1 as 1,
        '5m': 5 as 5
      }

      endTime = endTime ?? getNextCandleTime(Date.now(), interval)

      const series = await api.getChart({
        symbol,
        to: endTime,
        granularity: types[interval]
      })

      const candles = fillMissingCandles(series, { interval, endTime })

      if (candles.length > size) {
        candles.splice(0, candles.length - size)
      }

      return candles
    }
  })
}
