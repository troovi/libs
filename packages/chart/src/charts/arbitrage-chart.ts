import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CrosshairMode,
  LineStyle,
  Time,
  CandlestickSeries,
  BaselineSeries,
  HistogramSeries
} from 'lightweight-charts'

import {
  Candle,
  RulerTool,
  createVolumeFormatter,
  formatSeries,
  parseSeries,
  timeFormatter,
  formatTime,
  createPriceFormatter
} from '..'

import { createState } from '@troovi/transmit'
import { applyAlphaToHex, getMoveChange, rgbaToHex } from '@troovi/utils-js'

const theme = {
  lines: '#2d2d2d',
  background: '#0f0f0f',
  scale: '#2f3136',
  labels: '#474d57' // '#f51fa3' //'#c6f8fd' //'#ffa222' // 474d57
}

interface Options {
  markets: {
    futures: {
      priceStep: number
      onDataEnd: (lastVisibleTime: number) => Promise<Candle[]>
    }
    spot: {
      priceStep: number
      onDataEnd: (lastVisibleTime: number) => Promise<Candle[]>
    }
  }
  colors: {
    negative: string
    positive: string
  }
}

export class ArbitrageChartViewer {
  public isLoading = { spot: createState(false), futures: createState(false) }
  public hoverCandle = createState<null | { spot: Candle; futures: Candle }>(null)

  private chart: IChartApi
  private formatVolume: ReturnType<typeof createVolumeFormatter>

  private diffSeries: ISeriesApi<'Baseline'>

  private series = {
    spot: {} as ISeriesApi<'Candlestick'>,
    futures: {} as ISeriesApi<'Candlestick'>
  }

  private volumes = {
    spot: {} as ISeriesApi<'Histogram'>,
    futures: {} as ISeriesApi<'Histogram'>
  }

  private lastChartTime = {
    spot: null as Time | null,
    futures: null as Time | null
  }

  private lastUpdate = {
    spot: null as Candle | null,
    futures: null as Candle | null
  }

  public plugins = { ruler: {} as RulerTool }

  constructor(chartRef: HTMLDivElement, { markets, colors }: Options) {
    this.chart = createChart(chartRef, {
      width: chartRef.clientWidth,
      height: chartRef.clientHeight,
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: theme.labels },
        horzLine: { labelBackgroundColor: theme.labels }
      },
      layout: {
        textColor: '#ebebeb',
        panes: {
          separatorColor: '#2e2e2e',
          enableResize: true
        },
        background: {
          color: theme.background
        }
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

    // futures

    this.series = {
      spot: this.chart.addSeries(CandlestickSeries, {
        // up
        upColor: colors.positive,
        borderUpColor: colors.positive,
        wickUpColor: colors.positive,
        // down
        downColor: theme.background,
        borderDownColor: colors.positive,
        wickDownColor: colors.positive,
        priceLineVisible: false,
        baseLineVisible: false
      }),
      futures: this.chart.addSeries(CandlestickSeries, {
        // up
        upColor: colors.negative,
        borderUpColor: colors.negative,
        wickUpColor: colors.negative,
        // down
        downColor: theme.background,
        borderDownColor: colors.negative,
        wickDownColor: colors.negative,
        priceLineVisible: false,
        baseLineVisible: false
      })
    }

    this.volumes = {
      spot: this.chart.addSeries(HistogramSeries, {
        priceScaleId: 'bottom-volumes',
        priceFormat: { type: 'volume' }
      }),
      futures: this.chart.addSeries(HistogramSeries, {
        priceScaleId: 'top-volumes',
        priceFormat: { type: 'volume' }
      })
    }

    this.series.futures.applyOptions({
      priceFormat: {
        type: 'custom',
        minMove: markets.futures.priceStep,
        formatter: createPriceFormatter(markets.futures.priceStep)
      }
    })

    this.series.spot.applyOptions({
      priceFormat: {
        type: 'custom',
        minMove: markets.spot.priceStep,
        formatter: createPriceFormatter(markets.spot.priceStep)
      }
    })

    this.volumes.futures.priceScale().applyOptions({
      invertScale: true,
      scaleMargins: { top: 0, bottom: 0.9 }
    })

    this.volumes.spot.priceScale().applyOptions({
      scaleMargins: { top: 0.9, bottom: 0 }
    })

    // diff

    this.diffSeries = this.chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 0 },
      topLineColor: 'rgba( 38, 166, 154, 1)',
      topFillColor1: 'rgba( 38, 166, 154, 0.28)',
      topFillColor2: 'rgba( 38, 166, 154, 0.05)',
      bottomLineColor: 'rgba( 239, 83, 80, 1)',
      bottomFillColor1: 'rgba( 239, 83, 80, 0.05)',
      bottomFillColor2: 'rgba( 239, 83, 80, 0.28)'
    })

    this.diffSeries.createPriceLine({
      price: 0,
      color: '#a8a8a8',
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true
    })

    this.formatVolume = createVolumeFormatter({
      negative: rgbaToHex(applyAlphaToHex(colors.negative, 30)),
      positive: rgbaToHex(applyAlphaToHex(colors.positive, 30))
    })

    this.diffSeries.moveToPane(1)

    this.chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
      if (range !== null) {
        // futures
        if (!this.isLoading.futures.value) {
          if (this.lastChartTime.futures && +range.from <= +this.lastChartTime.futures + 1) {
            this.isLoading.futures.set(true)
            markets.futures.onDataEnd(+this.lastChartTime.futures * 1000).then((series) => {
              this.setData('futures', series)
              this.isLoading.futures.set(false)
            })
          }
        }
        // spot
        if (!this.isLoading.spot.value) {
          if (this.lastChartTime.spot && +range.from <= +this.lastChartTime.spot + 1) {
            this.isLoading.spot.set(true)
            markets.spot.onDataEnd(+this.lastChartTime.spot * 1000).then((series) => {
              this.setData('spot', series)
              this.isLoading.spot.set(false)
            })
          }
        }
      }
    })

    this.chart.subscribeCrosshairMove((e) => {
      if (e.time) {
        const spot = e.seriesData.get(this.series.spot)
        const futures = e.seriesData.get(this.series.futures)

        if (spot && futures) {
          const spotCandle = spot as CandlestickData<Time>
          const futuresCandle = futures as CandlestickData<Time>

          if (!this.hoverCandle.value || this.hoverCandle.value.spot.time !== spotCandle.time) {
            this.hoverCandle.set({ spot: parseSeries(spotCandle), futures: parseSeries(futuresCandle) })
          }
        }
      } else {
        this.hoverCandle.set(null)
      }
    })

    // set plugins
    this.plugins.ruler = new RulerTool(this.chart, this.series.futures)

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

  setData(market: 'spot' | 'futures', series: Candle[]) {
    if (series.length > 0) {
      this.lastChartTime[market] = formatTime(series[0].time)
      this.series[market].setData([...series.map(formatSeries), ...this.series[market].data()])
      this.volumes[market].setData([...series.map(this.formatVolume), ...this.volumes[market].data()])
      this.setDiff()
    }
  }

  update(market: 'spot' | 'futures', candle: Candle) {
    this.lastUpdate[market] = candle
    this.series[market].update(formatSeries(candle))
    this.volumes[market].update(this.formatVolume(candle))
    this.updateDiff()
  }

  private updateDiff() {
    if (this.lastUpdate.spot && this.lastUpdate.futures) {
      if (this.lastUpdate.spot.time === this.lastUpdate.futures.time) {
        this.diffSeries.update({
          time: formatTime(this.lastUpdate.spot.time),
          value: getMoveChange(this.lastUpdate.spot.high, this.lastUpdate.futures.high)
        })
      }
    }
  }

  private setDiff() {
    const spot = this.series.spot.data() as CandlestickData<Time>[]
    const futures = this.series.futures.data() as CandlestickData<Time>[]

    if (spot.length === 0 || futures.length === 0) {
      return
    }

    const data = this.diffSeries.data()

    const equalize = () => {
      if (+futures[futures.length - 1].time > +spot[spot.length - 1].time) {
        futures.pop()
        equalize()
      }

      if (+spot[spot.length - 1].time > +futures[futures.length - 1].time) {
        spot.pop()
        equalize()
      }
    }

    equalize()

    const size = Math.min(spot.length, futures.length)

    const shiftSpot = spot.length - size
    const shiftFutures = futures.length - size

    const values: { time: Time; value: number }[] = []

    for (let i = 0; i < size - data.length; i++) {
      if (spot[i + shiftSpot].time !== futures[i + shiftFutures].time) {
        throw 'time'
      }

      values.push({
        time: spot[i + shiftSpot].time,
        value: getMoveChange(spot[i + shiftSpot].high, futures[i + shiftFutures].high)
      })
    }

    this.diffSeries.setData([...values, ...data])
  }

  destroy() {
    this.chart.remove()
  }

  fitContent(from: number, to: number) {
    this.chart.timeScale().setVisibleRange({ from: formatTime(from), to: formatTime(to) })
  }
}

// const A = [          6,7,8,9 | 10,11,12,13,14,15,16,17]
// const B = [1,2,3,4,5,6,7,8,9 | 10,11,12,13,14,15,16,17]

// const S = 8

// const size = Math.min(A.length, B.length) // 4

// const shiftA = A.length - size
// const shiftB = B.length - size

// for(let i = 0; i < size; i++){
//   console.log(A[i + shiftA], B[i + shiftB])
// }
//
//
