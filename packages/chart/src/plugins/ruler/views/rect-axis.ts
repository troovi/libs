import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import {
  Coordinate,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  PrimitivePaneViewZOrder
} from 'lightweight-charts'
import { positionsBox } from '../utils'
import { RulerPrimitive, theme } from '..'

class RectangleAxisPaneRenderer implements IPrimitivePaneRenderer {
  _p1: number | null
  _p2: number | null
  _vertical: boolean = false

  constructor(p1: number | null, p2: number | null, vertical: boolean) {
    this._p1 = p1
    this._p2 = p2
    this._vertical = vertical
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this._p1 === null || this._p2 === null) return
      const ctx = scope.context
      const positions = positionsBox(
        this._p1,
        this._p2,
        this._vertical ? scope.verticalPixelRatio : scope.horizontalPixelRatio
      )
      ctx.fillStyle = theme.bgColorPositive
      if (this._vertical) {
        ctx.fillRect(0, positions.position, scope.bitmapSize.width, positions.length)
      } else {
        ctx.fillRect(positions.position, 0, positions.length, scope.bitmapSize.height)
      }
    })
  }
}

abstract class RectangleAxisPaneView implements IPrimitivePaneView {
  _source: RulerPrimitive
  _p1: number | null = null
  _p2: number | null = null
  _vertical: boolean = false

  constructor(source: RulerPrimitive, vertical: boolean) {
    this._source = source
    this._vertical = vertical
  }

  abstract getPoints(): [Coordinate | null, Coordinate | null]

  update() {
    ;[this._p1, this._p2] = this.getPoints()
  }

  renderer() {
    return new RectangleAxisPaneRenderer(this._p1, this._p2, this._vertical)
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'bottom'
  }
}

export class RectanglePriceAxisPaneView extends RectangleAxisPaneView {
  getPoints(): [Coordinate | null, Coordinate | null] {
    const series = this._source.series
    const y1 = series.priceToCoordinate(this._source._p1.price)
    const y2 = series.priceToCoordinate(this._source._p2.price)
    return [y1, y2]
  }
}

export class RectangleTimeAxisPaneView extends RectangleAxisPaneView {
  getPoints(): [Coordinate | null, Coordinate | null] {
    const timeScale = this._source.chart.timeScale()
    const x1 = timeScale.timeToCoordinate(this._source._p1.time)
    const x2 = timeScale.timeToCoordinate(this._source._p2.time)
    return [x1, x2]
  }
}
