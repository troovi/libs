import './styles.scss'

import { TradesService } from './service'
import { useEffect, useState } from 'react'
import { roundTo } from '@troovi/utils-js'
import { box, px, width as w } from '@troovi/utils-browser'

export const Trades = ({ trades, width = 280 }: { trades: TradesService; width: number }) => {
  const [, rerender] = useState([])

  useEffect(() => {
    const unsubscribe = trades.onRerender.subscribe(() => {
      rerender([])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="bubbles" style={w(width)} data-count={trades.prints.length}>
      {trades.prints.map((item, i) => {
        if (item.type === 'bubble') {
          const size = trades.getBubbleRadius(item.roundedQty.length) * 2

          return (
            <div
              className="trade-bubble"
              data-price={item.price}
              key={`trade-${i}-${item.price}-${item.lot}-${item.quantity}`}
              style={{ marginTop: `${item.marginTop}px` }}
            >
              <div className="quote-trade">{roundTo(item.quantity * item.price, 2)}$</div>
              <div style={box(size)} className="center trade rounded-full" data-lot={item.lot}>
                {item.roundedQty}
              </div>
            </div>
          )
        }

        if (item.type === 'angle') {
          const { hypotenyse } = item

          return (
            <div
              key={`angle-${i}`}
              className="relative"
              data-direction={item.direction}
              style={{
                minWidth: px(item.width),
                height: px(item.height),
                marginTop: px(item.marginTop),
                marginLeft: px(item.marginLeft),
                marginRight: px(item.marginRight)
              }}
            >
              <div
                className="hypotenyse"
                style={{
                  marginLeft: px(hypotenyse.marginLeft),
                  marginTop: px(hypotenyse.marginTop),
                  width: px(hypotenyse.width),
                  transform: hypotenyse.transform
                }}
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
