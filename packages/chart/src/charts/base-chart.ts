import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CrosshairMode,
  LineStyle,
  IPriceLine,
  Time,
  HistogramSeries,
  CandlestickSeries
} from 'lightweight-charts'

import {
  createVolumeFormatter,
  formatSeries,
  parseSeries,
  timeFormatter,
  formatTime,
  Candle,
  RulerTool,
  createPriceFormatter
} from '..'

import { createState } from '@troovi/transmit'
import { applyAlphaToHex, rgbaToHex } from '@troovi/utils-js'

const theme = {
  lines: '#2d2d2d',
  background: '#0f0f0f',
  scale: '#2f3136',
  labels: '#474d57' // '#f51fa3' //'#c6f8fd' //'#ffa222' // 474d57
}

const lines = {
  green: '#4eae1c',
  blue: 'blue',
  red: '#be1238',
  pink: 'rgb(255, 0, 169)',
  cursor: '#f4db44'
}

interface Options {
  priceStep: number
  onDataEnd?: (lastVisibleTime: number) => Promise<Candle[]>
  colors: {
    negative: string
    positive: string
  }
}

export class BaseChartViewer {
  public isLoading = createState(false)
  public hoverCandle = createState<null | Candle>(null)

  private chart: IChartApi
  private candlestickSeries: ISeriesApi<'Candlestick'>
  private volumesSeries: ISeriesApi<'Histogram'>

  private formatVolume: ReturnType<typeof createVolumeFormatter>

  private lastChartTime: Time | null

  public plugins = { ruler: {} as RulerTool }

  constructor(chartRef: HTMLDivElement, { priceStep, onDataEnd, colors }: Options) {
    this.chart = createChart(chartRef, {
      width: chartRef.clientWidth,
      height: chartRef.clientHeight,
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: theme.labels },
        horzLine: { labelBackgroundColor: theme.labels }
      },
      layout: {
        background: {
          color: theme.background
        },
        textColor: '#ebebeb'
      },
      grid: {
        vertLines: {
          style: LineStyle.Dashed,
          color: theme.lines
        },
        horzLines: {
          style: LineStyle.Dashed,
          color: theme.lines
        }
      },
      rightPriceScale: {
        borderColor: theme.scale,
        visible: true
      },
      timeScale: {
        borderColor: theme.scale,
        timeVisible: true
      },
      localization: {
        timeFormatter
      }
    })

    this.chart.applyOptions({
      crosshair: {
        mode: CrosshairMode.Normal
      }
    })

    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      // up
      upColor: colors.positive,
      borderUpColor: colors.positive,
      wickUpColor: colors.positive,
      // down
      downColor: colors.negative,
      borderDownColor: colors.negative,
      wickDownColor: colors.negative
    })

    this.candlestickSeries.applyOptions({
      priceFormat: {
        type: 'custom',
        minMove: priceStep,
        formatter: createPriceFormatter(priceStep)
      }
    })

    this.volumesSeries = this.chart.addSeries(HistogramSeries, {
      priceScaleId: '',
      priceFormat: {
        type: 'volume'
      }
    })

    this.volumesSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.9, // highest point of the series will be 70% away from the top
        bottom: 0
      }
    })

    this.formatVolume = createVolumeFormatter({
      negative: rgbaToHex(applyAlphaToHex(colors.negative, 30)),
      positive: rgbaToHex(applyAlphaToHex(colors.positive, 30))
    })

    if (onDataEnd) {
      this.chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
        if (range && this.lastChartTime && !this.isLoading.value) {
          if (+range.from <= +this.lastChartTime + 2) {
            this.isLoading.set(true)

            onDataEnd(+range.from * 1000).then((series) => {
              this.unshiftData(series)
              this.isLoading.set(false)
            })
          }
        }
      })
    }

    this.chart.subscribeCrosshairMove((e) => {
      if (e.time) {
        const data = e.seriesData.get(this.candlestickSeries)

        if (data) {
          const candle = data as CandlestickData<Time>

          if (!this.hoverCandle.value || this.hoverCandle.value.time !== candle.time) {
            this.hoverCandle.set(parseSeries(candle))
          }
        }
      } else {
        this.hoverCandle.set(null)
      }
    })

    // set plugins
    this.plugins.ruler = new RulerTool(this.chart, this.candlestickSeries)

    const observer = new ResizeObserver(() => {
      const height = chartRef.clientHeight

      if (height > 10) {
        chartRef.style.display = 'block'
        this.chart.resize(chartRef.clientWidth, height)
      } else {
        chartRef.style.display = 'none'
      }
    })

    observer.observe(chartRef)
  }

  createPriceLine(price: number, title: string, color: keyof typeof lines) {
    return this.candlestickSeries.createPriceLine({
      price,
      color: lines[color],
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title
    })
  }

  removePriceLine(line: IPriceLine) {
    this.candlestickSeries.removePriceLine(line)
  }

  setData(series: Candle[]) {
    if (series.length > 0) {
      this.lastChartTime = formatTime(series[0].time)

      this.candlestickSeries.setData(series.map(formatSeries))
      this.volumesSeries.setData(series.map(this.formatVolume))

      this.candlestickSeries.priceScale().applyOptions({ autoScale: true })
    }
  }

  unshiftData(series: Candle[]) {
    if (series.length > 0) {
      this.lastChartTime = formatTime(series[0].time)

      this.candlestickSeries.setData([...series.map(formatSeries), ...this.candlestickSeries.data()])
      this.volumesSeries.setData([...series.map(this.formatVolume), ...this.volumesSeries.data()])
    }
  }

  destroy() {
    this.candlestickSeries.setData([])
    this.volumesSeries.setData([])

    this.chart.removeSeries(this.candlestickSeries)
    this.chart.removeSeries(this.volumesSeries)

    this.chart.remove()
  }

  fitContent(from: number, to: number) {
    this.chart.timeScale().setVisibleRange({ from: formatTime(from), to: formatTime(to) })
  }

  update(candle: Candle) {
    this.candlestickSeries.update(formatSeries(candle))
    this.volumesSeries.update(this.formatVolume(candle))
  }

  getCurrentCandle() {
    const data = this.candlestickSeries.data() as CandlestickData<Time>[]
    return parseSeries(data[data.length - 1])
  }
}
