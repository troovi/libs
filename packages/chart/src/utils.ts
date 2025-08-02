import { CandlestickData, LineData, Time, UTCTimestamp } from 'lightweight-charts'
import { DateTimeFormatter } from './formatters/date-time-formatter'
import { Candle } from './series'
import { getFloatDigits } from '@troovi/utils-js'

const formatTime = (time: number) => Math.round(time / 1000) as UTCTimestamp

const createVolumeFormatter = ({ negative, positive }: { negative: string; positive: string }) => {
  return ({ time, close, open, quoteVolume }: Candle): LineData => {
    return {
      time: formatTime(time),
      value: quoteVolume, // volume,
      color: open < close ? positive : negative
    }
  }
}

// prettier-ignore
const formatSeries = ({ time, close, low, high, open, volume, quoteVolume }: Candle): CandlestickData => {
  return {
    time: formatTime(time),
    close,
    low,
    high,
    open,
    customValues: { volume, quoteVolume }
  }
}

const parseSeries = ({ time, close, low, high, open, customValues }: CandlestickData): Candle => {
  return {
    time: +time * 1000,
    close,
    low,
    high,
    open,
    volume: +(customValues?.volume as number) || 0,
    quoteVolume: +(customValues?.quoteVolume as number) || 0
  }
}

const createPriceFormatter = (priceStep: number) => {
  const precision = getFloatDigits(priceStep.toString())

  return (price: number) => {
    return price.toFixed(precision)
  }
}

const formatter = new DateTimeFormatter({})

export const timeFormatter = (time: Time) => {
  return formatter.format(new Date(+time * 1000))
}

export { formatTime, createVolumeFormatter, createPriceFormatter, formatSeries, parseSeries }
