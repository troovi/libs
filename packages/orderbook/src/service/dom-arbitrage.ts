import { ScrollAnimation } from '@troovi/utils-browser'
import { EventBroadcaster, roundTo } from '@troovi/utils-js'
import { createState } from '@troovi/transmit'

import { Track } from './types'
import { TickFormatter } from './tick-formatter'
import { OrderBookState, OrderBookUpdate } from './dom-state'

export interface OrderBookOptions {
  snapshot: OrderBookUpdate
  priceStep: number
}

export interface InitialScroll {
  scroll: number
  mode: 'top' | 'center'
}

interface DOMViewState {
  updateId: number
  track: Track
  ticks: string[]
  initialScroll?: InitialScroll
}

export class OrderBookService {
  public priceStep: number
  public tickHeight: number = 18
  public maxTicks: number = 140

  public viewState: DOMViewState = {
    updateId: 0,
    track: {},
    ticks: []
  }

  // state

  public readonly state: OrderBookState

  private readonly limits: {
    maxPrice: number
    minPrice: number
  }

  // prices

  private maxViewablePrice: number
  private minViewablePrice: number

  // current
  private viewablePrice: number
  private viewableTrack: Track = {}
  private viewableTicks: string[] = []

  private trackThreshold = 5

  // other
  private targetScrollPrice: number | null = null
  private updateAfterRendered: boolean = false

  public basevolume: number = 1
  public scrollable: ScrollAnimation | null = null
  public trackState = { id: 0, isRendered: false }

  public enableAutoScrolling = true

  public onRerender: (() => void) | null = null
  public afterTrackRendered: (() => void) | null = null

  public bestBid = createState(0)
  public bestAsk = createState(0)

  public onTrackChanged = new EventBroadcaster<void>()
  public onTickChanged = new EventBroadcaster<void>()

  public tickFormatter: TickFormatter

  constructor({ priceStep, snapshot }: OrderBookOptions) {
    this.priceStep = priceStep

    this.tickFormatter = new TickFormatter({ priceStep })
    this.state = new OrderBookState({ priceStep })

    this.bestBid = createState(snapshot.bids[0][0])
    this.bestAsk = createState(snapshot.asks[0][0])

    this.limits = {
      maxPrice: snapshot.asks[snapshot.asks.length - 1][0],
      minPrice: snapshot.bids[snapshot.bids.length - 1][0]
    }

    this.state.onBestBidChange.subscribe((price) => {
      this.bestBid.set(price)
    })

    this.state.onBestAskChange.subscribe((price) => {
      this.bestAsk.set(price)
    })

    this.state.update(snapshot)
    this.optimalVolumes(snapshot)
  }

  public setDefaultView() {
    this.viewablePrice = this.state.best.bids
    this.rebuildTrack()
  }

  private updateState(update: OrderBookUpdate) {
    this.state.update(update, ({ side, price, quantity }) => {
      const tick = this.viewableTrack[this.tickFormatter.getTick(price)]

      if (tick) {
        if (quantity) {
          tick[side][price] = quantity
        } else {
          delete tick[side][price]
        }

        tick[`${side}Volume`] = this.getClusterVolume(tick[side])
        tick.status = this.getTickStatus(tick)
      }
    })
  }

  private render(initialScroll?: InitialScroll) {
    this.viewState = {
      updateId: this.viewState.updateId + 1,
      ticks: this.viewableTicks,
      track: this.viewableTrack,
      initialScroll
    }

    this.onRerender?.()
  }

  public update(update: OrderBookUpdate) {
    if (!this.onRerender) {
      this.state.update(update)
      return
    }

    this.updateState(update)

    if (this.trackState.isRendered) {
      if (this.enableAutoScrolling) {
        const bestBid = this.state.best.bids

        if (bestBid !== this.targetScrollPrice) {
          if (bestBid > this.maxViewablePrice || bestBid < this.minViewablePrice) {
            this.setDefaultView()
            return
          }

          if (!this.isBestBidAreViewable()) {
            this.scrollToCenter()
          }
        }
      }

      this.render()
    } else {
      this.updateAfterRendered = true
    }
  }

  public onTrackRendered = () => {
    this.trackState.isRendered = true
    delete this.viewState.initialScroll

    if (this.updateAfterRendered) {
      this.updateAfterRendered = false

      if (this.enableAutoScrolling) {
        const bestBid = this.state.best.bids

        if (bestBid > this.maxViewablePrice || bestBid < this.minViewablePrice) {
          this.afterTrackRendered = null
          this.setDefaultView()
          return
        }
      }

      this.render()
    }

    if (this.afterTrackRendered) {
      this.afterTrackRendered()
    }
  }

  private isBestBidAreViewable() {
    const bestBidPosition = this.getPricePosition(this.state.best.bids)
    const position = this.scrollable?.getPosition()

    if (position) {
      if (bestBidPosition > position.scrollTop + position.clientHeight * (5 / 6)) {
        return false
      }

      if (bestBidPosition < position.scrollTop + position.clientHeight * (1 / 6)) {
        return false
      }
    }

    return true
  }

  private rebuildTrack(getScrollTop?: (data: { maxPrice: number; prevMaxPrice: number }) => number) {
    const tickStep = this.tickFormatter.tick
    const viewablePrice = +this.tickFormatter.getTick(this.viewablePrice)

    const maxTick = this.tickFormatter.getTick(viewablePrice + (tickStep * this.maxTicks) / 2)
    const minTick = this.tickFormatter.getTick(viewablePrice - (tickStep * this.maxTicks) / 2)

    const prevMaxPrice = this.maxViewablePrice

    this.minViewablePrice = +minTick
    this.maxViewablePrice = +maxTick

    const track: Track = {}
    const ticks: string[] = []

    for (let tick = minTick; +tick <= +maxTick; tick = this.tickFormatter.increaseTick(tick)) {
      const bids = { volume: 0, prices: {} as Record<string, number> }
      const asks = { volume: 0, prices: {} as Record<string, number> }

      this.tickFormatter.getPrices(+tick).forEach((price) => {
        const priceIndex = this.state.getIndex(+price)

        const ask = this.state.asks[priceIndex]
        const bid = this.state.bids[priceIndex]

        if (ask) {
          asks.volume += ask[1]
          asks.prices[ask[0]] = ask[1]
        }

        if (bid) {
          bids.volume += bid[1]
          bids.prices[bid[0]] = bid[1]
        }
      })

      track[tick] = {
        status: this.getTickStatus({
          bidsVolume: bids.volume,
          asksVolume: asks.volume
        }),
        asksVolume: asks.volume,
        bidsVolume: bids.volume,
        bids: bids.prices,
        asks: asks.prices
      }

      ticks.unshift(tick)
    }

    this.viewableTrack = track
    this.viewableTicks = ticks

    this.onTrackChanged.emit()

    this.trackState = { id: this.trackState.id + 1, isRendered: false }

    if (getScrollTop) {
      this.render({
        mode: 'top',
        scroll: getScrollTop({ maxPrice: this.maxViewablePrice, prevMaxPrice })
      })
    } else {
      this.render({
        mode: 'center',
        scroll: this.getPricePosition(this.state.best.bids)
      })
    }
  }

  private getTickStatus({ asksVolume: A, bidsVolume: B }: { bidsVolume: number; asksVolume: number }) {
    return A && B ? 'both' : A ? 'asks' : B ? 'bids' : 'free'
  }

  public onScroll() {
    this.getScrollable(({ scrollTop, clientHeight, scrollHeight }) => {
      this.viewablePrice = this.getPriceFromTopPosition(scrollTop + clientHeight / 2)

      if (this.viewState.initialScroll) {
        return
      }

      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100

      if (progress <= this.trackThreshold) {
        if (this.maxViewablePrice < this.limits.maxPrice) {
          this.rebuildTrack(({ prevMaxPrice, maxPrice }) => {
            const counts = roundTo(
              (maxPrice - prevMaxPrice) / this.tickFormatter.tick,
              this.tickFormatter.tickPrecision
            )

            return scrollTop + counts * this.tickHeight
          })
        }
      }

      if (progress >= 100 - this.trackThreshold) {
        if (this.minViewablePrice > this.limits.minPrice) {
          this.rebuildTrack(({ prevMaxPrice, maxPrice }) => {
            const counts = roundTo(
              (prevMaxPrice - maxPrice) / this.tickFormatter.tick,
              this.tickFormatter.tickPrecision
            )

            return scrollTop - counts * this.tickHeight
          })
        }
      }
    })
  }

  public scrollToCenter(speedValue?: number) {
    this.getScrollable(({ clientHeight, scrollHeight }, scrollable) => {
      const bestBid = this.state.best.bids
      const ticks = Math.abs(this.viewablePrice - bestBid) / this.tickFormatter.tick

      if (ticks < 1) {
        this.targetScrollPrice = null
        return
      }

      if (scrollable.isAnimating()) {
        scrollable.cancelAnimation()
        this.afterTrackRendered = null
        this.targetScrollPrice = null
      }

      const pxDistance = ticks * this.tickHeight
      const durationInSecond = 220 / 1000
      const speed = speedValue ?? pxDistance / durationInSecond

      if (ticks < 160) {
        const threshold = this.trackThreshold
        const targetPosition = this.getPricePosition(bestBid) - clientHeight / 2
        const targetPercent = (targetPosition / (scrollHeight - clientHeight)) * 100

        this.targetScrollPrice = bestBid

        if (targetPercent > threshold && targetPercent < 100 - threshold) {
          scrollable.moveTo(targetPosition, { effect: 'speed', speed }, () => {
            this.targetScrollPrice = null
          })
        } else {
          const direction = this.viewablePrice < bestBid ? 1 : -1
          const percent = direction === 1 ? threshold - 0.1 : 100 - threshold + 0.1
          const scrollTopValue = (percent / 100) * (scrollHeight - clientHeight)

          this.afterTrackRendered = () => {
            this.afterTrackRendered = null
            this.scrollToCenter(speedValue ?? speed)
          }

          scrollable.moveTo(scrollTopValue, { effect: 'speed', speed })
        }
      } else {
        this.setDefaultView()
      }
    })
  }

  private getScrollable(update: (scrollable: HTMLDivElement, controller: ScrollAnimation) => void) {
    if (this.scrollable && this.scrollable.ref.current) {
      update(this.scrollable.ref.current, this.scrollable)
    }
  }

  getPriceFromTopPosition(position: number) {
    return this.maxViewablePrice - Math.round(position / this.tickHeight) * this.tickFormatter.tick
  }

  // возвращает позицию цены относительно верхней границы стакана (getPriceDistanceFromTop)
  // price: 400, maxPrice: 1000; targetPrice is 600
  getPricePosition(price: number) {
    return this.priceToHeight(this.maxViewablePrice - price)
  }

  private priceToHeight(price: number) {
    return (price / this.tickFormatter.tick) * this.tickHeight
  }

  private getClusterVolume(cluster: Record<string, number>) {
    return Object.values(cluster).reduce((prev, curr) => prev + curr, 0)
  }

  private optimalVolumes(snapshot: OrderBookUpdate) {
    const volumes: number[] = [
      ...snapshot.bids.map(([, qty]) => qty),
      ...snapshot.asks.map(([, qty]) => qty)
    ]

    volumes.sort((a, b) => b - a)
    volumes.shift()
    volumes.shift()

    const highest = volumes.splice(0, Math.round(volumes.length / 2))

    const avg = highest.reduce((a, b) => a + b, 0) / volumes.length
    const vol = (100 * avg) / 1

    this.basevolume = Math.round(vol)
  }

  public setTickStep(tickStep: string) {
    if (this.tickFormatter.changeTick(tickStep)) {
      this.setDefaultView()
      this.onTickChanged.emit()
    }
  }
}
