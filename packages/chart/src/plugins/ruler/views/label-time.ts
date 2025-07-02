import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import {
  Coordinate,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  PrimitivePaneViewZOrder
} from 'lightweight-charts'
import { Point } from '../utils'
import { RulerPrimitive, theme } from '..'
import { timeFormatter } from '../../../utils'

export class TimeLabelPaneRenderer implements IPrimitivePaneRenderer {
  private _pos: Coordinate | null
  private _text: string

  constructor(text: string, pos: Coordinate | null) {
    this._pos = pos
    this._text = text
  }

  public draw(target: CanvasRenderingTarget2D): void {
    target.useMediaCoordinateSpace((scope) => {
      if (this._pos === null || this._text.length === 0) {
        return
      }

      const ctx = scope.context
      const font = `-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif`

      ctx.font = `${12}px ${font}`
      ctx.textBaseline = 'middle'

      const paddingX = 10
      const paddingTop = 14
      const radius = 2
      const height = 24

      const textMetrics = ctx.measureText(this._text)
      const width = textMetrics.width + paddingX * 2

      const rectX = this._pos - width / 2
      const rectY = 0 // чуть выше нижнего края

      ctx.beginPath()
      ctx.moveTo(rectX, rectY)
      ctx.lineTo(rectX + width, rectY)
      ctx.lineTo(rectX + width, rectY + height - radius)
      ctx.arcTo(rectX + width, rectY + height, rectX + width - radius, rectY + height, radius)
      ctx.lineTo(rectX + radius, rectY + height)
      ctx.arcTo(rectX, rectY + height, rectX, rectY + height - radius, radius)
      ctx.lineTo(rectX, rectY)
      ctx.closePath()

      ctx.fillStyle = theme.labelBgColorPositive
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.fillText(this._text, rectX + paddingX, rectY + paddingTop)
    })
  }
}

export class TimeLabelPaneView implements IPrimitivePaneView {
  _source: RulerPrimitive
  _pos: Coordinate | null = null
  _point: Point

  constructor(source: RulerPrimitive, point: Point) {
    this._source = source
    this._point = point
  }

  update(point: Point) {
    const timeScale = this._source.chart.timeScale()

    this._pos = timeScale.timeToCoordinate(point.time)
    this._point = point
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    return new TimeLabelPaneRenderer(timeFormatter(this._point.time), this._pos)
  }
}
