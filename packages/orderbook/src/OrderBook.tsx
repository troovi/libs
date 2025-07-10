import './styles.scss'
import cn from 'classnames'

import { useEffect, useMemo, useRef, useState } from 'react'

import { DomAdditionalProps, Slots } from './Slots'
import { ScrollAnimation, px, width } from '@troovi/utils-browser'
import { OrderBookService } from './dom'

interface OrderBookProps extends DomAdditionalProps {
  depth: OrderBookService
  Header?: React.ReactNode
  className?: string
  DOMPrimitives?: React.ReactNode
  LeftPane?: {
    Element: React.ReactNode
    width: number
    TopElement?: React.ReactNode
    BottomElement?: React.ReactNode
    FrontElement?: React.ReactNode
  }
}

export const OrderBook = ({ depth, ...props }: OrderBookProps) => {
  const { DOMPrimitives, Header, LeftPane, className, ...restProps } = props

  const [isRendered, setRender] = useState(false)
  const [tickStep, setTickStep] = useState(depth.tickFormatter.getTickStep())

  const scrollableRef = useRef<HTMLDivElement>(null)

  if (depth.scrollable === null) {
    depth.scrollable = new ScrollAnimation(scrollableRef)
  }

  useEffect(() => {
    setRender(true)

    const unsubscribe = depth.onTickChanged.subscribe(() => {
      setTickStep(depth.tickFormatter.getTickStep())
    })

    return () => {
      depth.scrollable = null
      unsubscribe()
    }
  }, [])

  const handleMouseEnter = () => {
    depth.enableAutoScrolling = false
  }

  const handleMouseLeave = () => {
    depth.enableAutoScrolling = true
    depth.scrollToCenter()
  }

  useMemo(() => {
    depth.setDefaultView()
  }, [])

  const TICK_WIDTH = tickStep.length * (20 / 3)
  const SLOTS_WIDTH = Math.max(108 + TICK_WIDTH, 148)

  return (
    <div
      className={cn('orderbook', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={width((LeftPane?.width ?? 0) + SLOTS_WIDTH + 8 * 2 + 2)}
    >
      {Header}
      <div className="orderbook-inner">
        {LeftPane && (
          <>
            {LeftPane.FrontElement}
            {LeftPane.TopElement && (
              <div className="top-left" style={width(LeftPane.width - 8)}>
                {LeftPane.TopElement}
              </div>
            )}
            {LeftPane.BottomElement && (
              <div className="bottom-left" style={width(LeftPane.width - 8)}>
                {LeftPane.BottomElement}
              </div>
            )}
          </>
        )}
        <div className="orderbook-content" onScroll={() => depth.onScroll()} ref={scrollableRef}>
          <div
            className="orderbook-content-layout"
            style={{ height: px(depth.maxTicks * depth.tickHeight) }}
          >
            {LeftPane && LeftPane.Element}
            {isRendered && (
              <div className="dom-list" style={width(SLOTS_WIDTH)}>
                <Slots dom={depth} {...restProps} />
                {DOMPrimitives}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
