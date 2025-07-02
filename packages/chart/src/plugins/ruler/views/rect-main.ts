import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import { IPrimitivePaneRenderer, IPrimitivePaneView } from 'lightweight-charts'
import { ViewPoint, positionsBox } from '../utils'
import { RulerPrimitive, theme } from '..'

class RectanglePaneRenderer implements IPrimitivePaneRenderer {
  _p1: ViewPoint
  _p2: ViewPoint

  constructor(p1: ViewPoint, p2: ViewPoint) {
    this._p1 = p1
    this._p2 = p2
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this._p1.x === null || this._p1.y === null || this._p2.x === null || this._p2.y === null) {
        return
      }

      const ctx = scope.context
      const horizontalPositions = positionsBox(this._p1.x, this._p2.x, scope.horizontalPixelRatio)
      const verticalPositions = positionsBox(this._p1.y, this._p2.y, scope.verticalPixelRatio)

      if (this._p1.y > this._p2.y) {
        ctx.fillStyle = theme.bgColorPositive
      } else {
        ctx.fillStyle = theme.bgColorNegative
      }

      ctx.fillRect(
        horizontalPositions.position,
        verticalPositions.position,
        horizontalPositions.length,
        verticalPositions.length
      )
    })
  }
}

export class RectanglePaneView implements IPrimitivePaneView {
  _source: RulerPrimitive
  _p1: ViewPoint = { x: null, y: null }
  _p2: ViewPoint = { x: null, y: null }

  constructor(source: RulerPrimitive) {
    this._source = source
  }

  update(p1: ViewPoint, p2: ViewPoint) {
    this._p1 = p1
    this._p2 = p2
  }

  renderer() {
    return new RectanglePaneRenderer(this._p1, this._p2)
  }
}
