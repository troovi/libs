import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts'
import { PluginBase } from './base-primitive'
import { Point } from './utils'

// views
import { TimeLabelPaneView } from './views/label-time'
import { TrandLinePaneView } from './views/line'
import { PriceLabelPaneView } from './views/label-price'
import { TextBoxPaneView } from './views/text-box'
import { RectanglePaneView } from './views/rect-main'
import { RectanglePriceAxisPaneView, RectangleTimeAxisPaneView } from './views/rect-axis'
import { applyAlphaToHex } from '@troovi/utils-js'

const negative = '#F7525F'
const positive = '#1E53E5'

export const theme = {
  bgColorPositive: applyAlphaToHex(positive, 20),
  bgColorNegative: applyAlphaToHex(negative, 20),
  colorPositive: positive,
  colorNegative: negative,
  labelBgColorPositive: positive,
  labelBgColorNegative: negative
}

export class RulerPrimitive extends PluginBase {
  _p1: Point
  _p2: Point

  // main chart
  _mainViews: (RectanglePaneView | TextBoxPaneView | TrandLinePaneView)[]

  // time panel
  _timeRectPaneView: RectangleTimeAxisPaneView
  _p1TimeLabelView: TimeLabelPaneView
  _p2TimeLabelView: TimeLabelPaneView

  // price panel
  _priceRectPaneView: RectanglePriceAxisPaneView
  _p1PriceLabelView: PriceLabelPaneView
  _p2PriceLabelView: PriceLabelPaneView

  constructor(p1: Point, p2: Point) {
    super()

    this._p1 = p1
    this._p2 = p2

    this._mainViews = [
      new RectanglePaneView(this),
      new TextBoxPaneView(this),
      new TrandLinePaneView(this, true),
      new TrandLinePaneView(this, false)
    ]

    // time pane
    this._timeRectPaneView = new RectangleTimeAxisPaneView(this, false)
    this._p1TimeLabelView = new TimeLabelPaneView(this, p1)
    this._p2TimeLabelView = new TimeLabelPaneView(this, p2)

    // price pane
    this._priceRectPaneView = new RectanglePriceAxisPaneView(this, true)
    this._p1PriceLabelView = new PriceLabelPaneView(this, p1)
    this._p2PriceLabelView = new PriceLabelPaneView(this, p2)
  }

  private updateMainPane() {
    const series = this.series
    const timeScale = this.chart.timeScale()

    const y1 = series.priceToCoordinate(this._p1.price)
    const y2 = series.priceToCoordinate(this._p2.price)
    const x1 = timeScale.timeToCoordinate(this._p1.time)
    const x2 = timeScale.timeToCoordinate(this._p2.time)

    this._mainViews.forEach((pw) => {
      pw.update({ x: x1, y: y1 }, { x: x2, y: y2 })
    })
  }

  updateAllViews() {
    this.updateMainPane()

    // time pane
    this._timeRectPaneView.update()
    this._p1TimeLabelView.update(this._p1)
    this._p2TimeLabelView.update(this._p2)

    // price pane
    this._priceRectPaneView.update()
    this._p1PriceLabelView.update(this._p1)
    this._p2PriceLabelView.update(this._p2)
  }

  paneViews() {
    return this._mainViews
  }

  priceAxisPaneViews() {
    return [this._priceRectPaneView, this._p1PriceLabelView, this._p2PriceLabelView]
  }

  timeAxisPaneViews() {
    return [this._timeRectPaneView, this._p1TimeLabelView, this._p2TimeLabelView]
  }

  public updateEndPoint(p2: Point) {
    this._p2 = p2
    this.updateMainPane()

    this._p2TimeLabelView.update(p2)
    this._p2PriceLabelView.update(p2)

    this.requestUpdate()
  }
}

export class RulerTool {
  private _chart: IChartApi
  private _series: ISeriesApi<SeriesType>
  private _ruler: RulerPrimitive | null = null
  private _drawing: boolean = false

  public onStopDrawing: () => void = () => {}

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this._chart = chart
    this._series = series
  }

  private _clickHandler = (param: MouseEventParams) => this._onClick(param)
  private _moveHandler = (param: MouseEventParams) => this._onMouseMove(param)

  stopDrawing() {
    this._drawing = false
    this._chart.unsubscribeClick(this._clickHandler)
    this._chart.unsubscribeCrosshairMove(this._moveHandler)

    if (this._ruler) {
      this._series.detachPrimitive(this._ruler)
      this._ruler = null
    }
  }

  startDrawing(): void {
    this._drawing = true
    this._chart.subscribeClick(this._clickHandler)
    this._chart.subscribeCrosshairMove(this._moveHandler)
  }

  private _onClick(param: MouseEventParams) {
    if (!param.point || !param.time || !param.logical) return

    const price = this._series.coordinateToPrice(param.point.y)

    if (price === null) {
      return
    }

    if (this._ruler) {
      if (this._drawing) {
        this._drawing = false
      } else {
        this.stopDrawing()
        this.onStopDrawing()
      }
    } else {
      const point: Point = {
        time: param.time,
        logical: param.logical,
        price
      }

      const ruler = new RulerPrimitive(point, point)

      this._ruler = ruler
      this._series.attachPrimitive(ruler)
    }
  }

  private _onMouseMove(param: MouseEventParams) {
    if (this._ruler && this._drawing && param.point && param.time && param.logical) {
      const price = this._series.coordinateToPrice(param.point.y)

      if (price === null) {
        return
      }

      this._ruler.updateEndPoint({
        time: param.time,
        logical: param.logical,
        price
      })
    }
  }
}
