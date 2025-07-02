import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import { IPrimitivePaneRenderer, IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import { ViewPoint, formatDuration } from '../utils'
import { RulerPrimitive, theme } from '..'
import { getFloatDigits, getPrecisionStep } from '@troovi/utils-js'

class TextBoxPaneRenderer implements IPrimitivePaneRenderer {
  private _p1: ViewPoint
  private _p2: ViewPoint
  private _texts: string[]

  constructor(p1: ViewPoint, p2: ViewPoint, text: string[]) {
    this._p1 = p1
    this._p2 = p2
    this._texts = text
  }

  draw(target: CanvasRenderingTarget2D) {
    const count = this._texts.length

    const longestText = this._texts.reduce((longest, text) => {
      if (text.length > longest.length) {
        return text
      }

      return longest
    }, '')

    target.useMediaCoordinateSpace((scope) => {
      if (this._p1.x === null || this._p1.y === null || this._p2.x === null || this._p2.y === null) {
        return
      }

      const ctx = scope.context
      const font = `-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif`

      ctx.font = `${12}px ${font}`

      const longestTextMeasurements = ctx.measureText(longestText)
      const boxWidth = longestTextMeasurements.width + 20
      const lineHeight = 20
      const boxHeight = count * lineHeight + 10

      const data = {
        position: { x: (this._p1.x + this._p2.x) / 2 - boxWidth / 2, y: 0 },
        color: ''
      }

      if (this._p1.y > this._p2.y) {
        data.color = theme.labelBgColorPositive
        data.position.y = this._p2.y - boxHeight - 10
      } else {
        data.color = theme.labelBgColorNegative
        data.position.y = this._p2.y + 10
      }

      const centerX = data.position.x + boxWidth / 2

      // background
      ctx.beginPath()
      ctx.roundRect(data.position.x, data.position.y, boxWidth, boxHeight, 6)
      ctx.globalAlpha = 1
      ctx.fillStyle = data.color
      ctx.fill()
      ctx.globalAlpha = 1

      // text
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#FFFFFF'

      let currentY = data.position.y + lineHeight / 2 + 5

      this._texts.forEach((text) => {
        ctx.fillText(text, centerX, currentY)
        currentY += lineHeight
      })
    })
  }
}

export class TextBoxPaneView implements IPrimitivePaneView {
  _source: RulerPrimitive

  _pos1: ViewPoint = { x: null, y: null }
  _pos2: ViewPoint = { x: null, y: null }

  constructor(source: RulerPrimitive) {
    this._source = source
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  update(pos1: ViewPoint, pos2: ViewPoint) {
    this._pos1 = pos1
    this._pos2 = pos2
  }

  renderer() {
    const { price: price1, time: time1, logical: i1 } = this._source._p1
    const { price: price2, time: time2, logical: i2 } = this._source._p2

    const distance = price2 - price1
    const percent = (100 * distance) / Math.abs(price1)

    const bars = i2 - i1
    const secondsDistance = (time2 as number) - (time1 as number)

    const distancePrice = this._source.series.priceFormatter().format(distance)
    const priceStep = +getPrecisionStep(getFloatDigits(distancePrice))

    return new TextBoxPaneRenderer(this._pos1, this._pos2, [
      `${distancePrice} (${Math.round(100 * percent) / 100}%) ${Math.round(+distancePrice / priceStep)}`,
      `${bars} bars, ${formatDuration(secondsDistance)}`
    ])
  }
}
