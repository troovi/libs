import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { roundVolume } from './service/utils'
import { OrderBookService, InitialScroll } from './dom'

interface TickData {
  asksVolume: number
  bidsVolume: number
}

export interface DomAdditionalProps {
  onTickOver?: (tick: string, data: TickData) => void
  onTickClick?: (tick: string, data: TickData) => void
  onDomLeave?: () => void
}

interface SlotsProps extends DomAdditionalProps {
  dom: OrderBookService
}

const Slots = ({ dom, onDomLeave, onTickClick, onTickOver }: SlotsProps) => {
  const [, rerender] = useState([])

  useMemo(() => {
    dom.onRerender = () => rerender([])
  }, [])

  useEffect(() => {
    return () => {
      dom.onRerender = null
    }
  }, [])

  useEffect(() => {
    if (!dom.trackState.isRendered) {
      dom.onTrackRendered()
    }
  }, [dom.trackState])

  const { updateId, initialScroll, ticks, track } = dom.viewState

  return (
    <>
      {initialScroll && (
        <ApplyScroll key={`initial-${updateId}`} initialScroll={initialScroll} dom={dom} />
      )}
      <div className="dom-css" onMouseLeave={onDomLeave}>
        {ticks.map((tick, i) => {
          const item = track[tick]
          const volume = item.asksVolume + item.bidsVolume

          return (
            <div
              className={item.status}
              key={`tick--${tick}--${item.status}-${i}`}
              onMouseOver={() => onTickOver?.(tick, item)}
              onClick={() => onTickClick?.(tick, item)}
            >
              <nav style={{ width: `${(volume * 100) / dom.basevolume}%` }} />
              <div>
                <div>
                  {item.status === 'both'
                    ? `${roundVolume(item.asksVolume)} | ${roundVolume(item.bidsVolume)}`
                    : roundVolume(volume)}
                </div>
                <div>{tick}</div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

interface InitialProps {
  dom: OrderBookService
  initialScroll: InitialScroll
}

const ApplyScroll = ({ dom, initialScroll }: InitialProps) => {
  useLayoutEffect(() => {
    const scrollable = dom.scrollable?.ref.current

    if (scrollable) {
      if (initialScroll.position === 'center') {
        scrollable.scrollTop = initialScroll.scroll - scrollable.clientHeight / 2
      }

      if (initialScroll.position === 'top') {
        scrollable.scrollTop = initialScroll.scroll
      }
    }
  }, [])

  return null
}

export { Slots }
