import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import {
  Coordinate,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  PrimitivePaneViewZOrder
} from 'lightweight-charts'
import { RulerPrimitive, theme } from '..'
import { Point } from '../utils'

export class PriceLabelPaneRenderer implements IPrimitivePaneRenderer {
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

      const paddingX = 8
      const height = 20
      const radius = 2

      const textMetrics = ctx.measureText(this._text)
      const width = textMetrics.width + paddingX * 2

      const rectX = 0
      const rectY = this._pos - height / 2

      ctx.beginPath()
      ctx.moveTo(rectX, rectY)
      ctx.lineTo(rectX + width - radius, rectY)
      ctx.arcTo(rectX + width, rectY, rectX + width, rectY + radius, radius)
      ctx.lineTo(rectX + width, rectY + height - radius)
      ctx.arcTo(rectX + width, rectY + height, rectX + width - radius, rectY + height, radius)
      ctx.lineTo(rectX, rectY + height)
      ctx.closePath()

      ctx.fillStyle = theme.labelBgColorPositive
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.fillText(this._text, rectX + paddingX, this._pos)
    })
  }
}

export class PriceLabelPaneView implements IPrimitivePaneView {
  _source: RulerPrimitive
  _pos: Coordinate | null = null
  _point: Point

  constructor(source: RulerPrimitive, point: Point) {
    this._source = source
    this._point = point
  }

  update(point: Point) {
    this._pos = this._source.series.priceToCoordinate(point.price)
    this._point = point
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const price = this._source.series.priceFormatter().format(this._point.price)
    return new PriceLabelPaneRenderer(price, this._pos)
  }
}
