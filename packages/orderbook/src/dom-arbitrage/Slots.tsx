import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { width as w } from '@troovi/utils-browser'
import { roundVolume } from '../service/utils'
import { OrderBookArbitrageService, InitialScroll } from './service'

interface SlotsProps {
  dom: OrderBookArbitrageService
  width: number
}

const Slots = ({ dom, width }: SlotsProps) => {
  const [, rerender] = useState([])

  useMemo(() => {
    dom.rerenderTrack = () => {
      rerender([])
    }
  }, [])

  useEffect(() => {
    return () => {
      dom.rerenderTrack = null
    }
  }, [])

  useEffect(() => {
    if (!dom.trackState.isRendered) {
      dom.onTrackRendered()
    }
  }, [dom.trackState])

  const { initialScroll, updateId } = dom.viewState

  return (
    <div className="dom-list" style={w(width)}>
      {initialScroll && (
        <ApplyScroll key={`initial-${updateId}`} initialScroll={initialScroll} dom={dom} />
      )}
      <div className="dom-arbitrage">
        <div>
          <Book dom={dom} side="F" />
        </div>
        <div className="price-scale">
          {dom.viewableTicks.map((tick, i) => (
            <div key={`tick--${tick}-${i}`}>{tick}</div>
          ))}
        </div>
        <div>
          <Book dom={dom} side="S" />
        </div>
      </div>
    </div>
  )
}

const Book = ({ dom, side }: { dom: OrderBookArbitrageService; side: 'S' | 'F' }) => {
  const [, rerender] = useState([])

  useMemo(() => {
    dom[side].rerender = () => {
      rerender([])
    }
  }, [])

  useEffect(() => {
    return () => {
      dom[side].rerender = null
    }
  }, [])

  return (
    <>
      {dom.viewableTicks.map((tick, i) => {
        const { status, asksVolume, bidsVolume } = dom.viewableTrack[tick][side]
        const volume = asksVolume + bidsVolume

        return (
          <div key={`tick--${tick}-${i}`} data-tick={tick} className={`tick ${status}`}>
            <nav style={{ width: `${(volume * 100) / dom[side].basevolume}%` }} />
            <div>
              <div>
                <div>
                  {status === 'both'
                    ? `${roundVolume(asksVolume)} | ${roundVolume(bidsVolume)}`
                    : roundVolume(volume)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

interface InitialProps {
  dom: OrderBookArbitrageService
  initialScroll: InitialScroll
}

const ApplyScroll = ({ dom, initialScroll }: InitialProps) => {
  useLayoutEffect(() => {
    const scrollable = dom.scrollable?.ref.current

    if (scrollable) {
      if (initialScroll.mode === 'center') {
        scrollable.scrollTop = initialScroll.scroll - scrollable.clientHeight / 2
      }

      if (initialScroll.mode === 'top') {
        scrollable.scrollTop = initialScroll.scroll
      }
    }
  }, [])

  return null
}

export { Slots }
