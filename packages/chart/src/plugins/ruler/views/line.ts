import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import { IPrimitivePaneRenderer, IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import { ViewPoint } from '../utils'
import { RulerPrimitive, theme } from '..'

class TrandLinePaneRenderer implements IPrimitivePaneRenderer {
  private _p1: ViewPoint
  private _p2: ViewPoint
  private _vertical: boolean

  constructor(p1: ViewPoint, p2: ViewPoint, vertical: boolean) {
    this._p1 = p1
    this._p2 = p2
    this._vertical = vertical
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useMediaCoordinateSpace((scope) => {
      if (this._p1.x === null || this._p1.y === null || this._p2.x === null || this._p2.y === null) {
        return
      }

      const ctx = scope.context
      const headSize = 8

      const start = { x: 0, y: 0 }
      const end = { x: 0, y: 0 }

      if (this._vertical) {
        start.y = this._p1.y
        start.x = (this._p1.x + this._p2.x) / 2
        end.y = this._p2.y
        end.x = start.x
      } else {
        start.x = this._p1.x
        start.y = (this._p1.y + this._p2.y) / 2
        end.x = this._p2.x
        end.y = start.y
      }

      const dx = end.x - start.x
      const dy = end.y - start.y
      const angle = Math.atan2(dy, dx)

      ctx.beginPath()
      ctx.strokeStyle =
        this._p1.y > this._p2.y ? theme.labelBgColorPositive : theme.labelBgColorNegative
      ctx.lineWidth = 1.2

      // Основная горизонтальная линия
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)

      if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
        // Левая наклонная линия (вниз)
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(
          end.x - headSize * Math.cos(angle - Math.PI / 4),
          end.y - headSize * Math.sin(angle - Math.PI / 4)
        )

        // Правая наклонная линия (вверх)
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(
          end.x - headSize * Math.cos(angle + Math.PI / 4),
          end.y - headSize * Math.sin(angle + Math.PI / 4)
        )
      }

      ctx.stroke()
    })
  }
}

export class TrandLinePaneView implements IPrimitivePaneView {
  _source: RulerPrimitive
  _vertical: boolean = false

  _p1: ViewPoint = { x: null, y: null }
  _p2: ViewPoint = { x: null, y: null }

  constructor(source: RulerPrimitive, vertical: boolean) {
    this._source = source
    this._vertical = vertical
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  update(p1: ViewPoint, p2: ViewPoint) {
    this._p1 = p1
    this._p2 = p2
  }

  renderer() {
    return new TrandLinePaneRenderer(this._p1, this._p2, this._vertical)
  }
}
