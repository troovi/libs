import { ScrollAnimation } from '@troovi/utils-browser'
import { EventBroadcaster, getFloatDigits, roundTo } from '@troovi/utils-js'
import { createState } from '@troovi/transmit'

import { TickFormatter } from '../service/tick-formatter'
import { OrderBookState, OrderBookUpdate } from '../service/dom-state'
import { TickData } from '../service/types'

interface Track {
  [tick: string]: { S: TickData; F: TickData }
}

interface Prices {
  [price: number]: string
}

interface Book {
  snapshot: OrderBookUpdate
  priceStep: number
  factor?: number
}

interface TrackViewState {
  updateId: number
  initialScroll?: InitialScroll
}

export interface OrderBookOptions {
  S: Book
  F: Book
}

export interface InitialScroll {
  scroll: number
  mode: 'top' | 'center'
}

const books = ['S', 'F'] as const

class BookService {
  public readonly state: OrderBookState

  public readonly limits: {
    maxPrice: number
    minPrice: number
  }

  public priceFactor: number = 1
  public priceFormatter: (price: number) => number = (n) => n
  public inversePriceFormatter: (price: number) => number = (n) => n

  public basevolume: number = 1

  public bestBid = createState(0)
  public bestAsk = createState(0)

  public updateAfterRendered: boolean = false
  public rerender: (() => void) | null = null

  constructor({ factor, priceStep, snapshot }: Book) {
    if (factor) {
      this.priceFactor = factor

      const basePrecision = getFloatDigits(priceStep.toString())
      const precision = basePrecision + Math.log10(factor)

      this.priceFormatter = (price: number) => {
        return roundTo(price / factor, precision)
      }

      this.inversePriceFormatter = (price: number) => {
        return roundTo(price * factor, basePrecision)
      }
    }

    this.state = new OrderBookState({ priceStep })

    this.bestBid = createState(this.getBestBid())
    this.bestAsk = createState(this.getBestAsk())

    this.limits = {
      maxPrice: this.priceFormatter(snapshot.asks[snapshot.asks.length - 1][0]),
      minPrice: this.priceFormatter(snapshot.bids[snapshot.bids.length - 1][0])
    }

    this.state.onBestBidChange.subscribe((price) => {
      this.bestBid.set(this.priceFormatter(price))
    })

    this.state.onBestAskChange.subscribe((price) => {
      this.bestAsk.set(this.priceFormatter(price))
    })

    this.state.update(snapshot)
    this.optimalVolumes(snapshot)
  }

  public getBestBid() {
    return this.priceFormatter(this.state.best.bids)
  }

  public getBestAsk() {
    return this.priceFormatter(this.state.best.asks)
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
    const vol = (100 * avg * this.priceFactor) / 1

    this.basevolume = Math.round(vol)
  }
}

export class OrderBookArbitrageService {
  public tickHeight: number = 18
  public maxTicks: number = 140

  // state
  public viewState: TrackViewState = {
    updateId: 0
  }

  public tickFormatter: TickFormatter

  public S: BookService
  public F: BookService

  private readonly limits: {
    maxPrice: number
    minPrice: number
  }

  // prices

  private maxViewablePrice: number
  private minViewablePrice: number

  // current

  private middlePrice: number
  public viewableTrack: Track = {}
  public viewableTicks: string[] = []
  private viewablePrices: { S: Prices; F: Prices } = { S: {}, F: {} }

  // scroll

  private trackThreshold = 5

  // other
  private targetScrollPrice: number | null = null

  public rerenderTrack: (() => void) | null = null

  public scrollable: ScrollAnimation | null = null
  public trackState = { id: 0, isRendered: false }

  public enableAutoScrolling = true

  public afterTrackRendered: (() => void) | null = null

  public onTrackChanged = new EventBroadcaster<void>()
  public onTickChanged = new EventBroadcaster<void>()

  constructor(options: OrderBookOptions) {
    books.forEach((book) => {
      this[book] = new BookService(options[book])
    })

    this.tickFormatter = new TickFormatter({
      priceStep: Math.min(
        this.S.priceFormatter(options.S.priceStep),
        this.F.priceFormatter(options.F.priceStep)
      )
    })

    this.limits = {
      maxPrice: Math.min(this.S.limits.maxPrice, this.S.limits.maxPrice),
      minPrice: Math.max(this.F.limits.minPrice, this.F.limits.minPrice)
    }
  }

  public getMiddlePrice() {
    return Math.min(this.S.getBestBid(), this.F.getBestAsk())
  }

  public setDefaultView() {
    this.middlePrice = this.getMiddlePrice()
    this.rebuildTrack()
  }

  private updateState(update: OrderBookUpdate, book: 'S' | 'F') {
    this[book].state.update(update, ({ side, price, quantity }) => {
      const tick = this.viewableTrack[this.viewablePrices[book][price]]

      if (tick) {
        // update tick

        if (quantity) {
          tick[book][side][price] = quantity
        } else {
          delete tick[book][side][price]
        }

        tick[book][`${side}Volume`] = this.getClusterVolume(tick[book][side]) * this[book].priceFactor
        tick[book].status = this.getTickStatus(tick[book])
      }
    })
  }

  private renderBook(book: 'S' | 'F') {
    this[book].rerender?.()
  }

  private renderTrack(initialScroll: InitialScroll) {
    this.viewState = {
      updateId: this.viewState.updateId + 1,
      initialScroll
    }

    this.rerenderTrack?.()
  }

  public update(update: OrderBookUpdate, book: 'S' | 'F') {
    if (!this[book].rerender) {
      this[book].state.update(update)
      return
    }

    this.updateState(update, book)

    if (this.trackState.isRendered) {
      // autoscrolling
      if (this.enableAutoScrolling) {
        const middlePrice = this.getMiddlePrice()

        if (middlePrice !== this.targetScrollPrice) {
          if (middlePrice > this.maxViewablePrice || middlePrice < this.minViewablePrice) {
            this.setDefaultView()
            return
          }

          if (!this.isMiddlePriceAreViewable()) {
            this.scrollToCenter()
          }
        }
      }

      this.renderBook(book)
    } else {
      this[book].updateAfterRendered = true
    }
  }

  // only in hook usage
  public onTrackRendered() {
    this.trackState.isRendered = true
    delete this.viewState.initialScroll

    books.forEach((book) => {
      if (this[book].updateAfterRendered) {
        this[book].updateAfterRendered = false

        if (this.enableAutoScrolling) {
          const middlePrice = this.getMiddlePrice()

          if (middlePrice > this.maxViewablePrice || middlePrice < this.minViewablePrice) {
            this.afterTrackRendered = null
            this.setDefaultView()
            return
          }
        }

        this.renderBook(book)
      }
    })

    if (this.afterTrackRendered) {
      this.afterTrackRendered()
    }
  }

  private isMiddlePriceAreViewable() {
    const middlePricePosition = this.getPricePosition(this.getMiddlePrice())
    const position = this.scrollable?.getPosition()

    if (position) {
      if (middlePricePosition > position.scrollTop + position.clientHeight * (5 / 6)) {
        return false
      }

      if (middlePricePosition < position.scrollTop + position.clientHeight * (1 / 6)) {
        return false
      }
    }

    return true
  }

  private rebuildTrack(getScrollTop?: (data: { maxPrice: number; prevMaxPrice: number }) => number) {
    const tickStep = this.tickFormatter.tick
    const middlePrice = +this.tickFormatter.getTick(this.middlePrice)

    const maxTick = this.tickFormatter.getTick(middlePrice + (tickStep * this.maxTicks) / 2)
    const minTick = this.tickFormatter.getTick(middlePrice - (tickStep * this.maxTicks) / 2)

    const prevMaxPrice = this.maxViewablePrice

    this.maxViewablePrice = +maxTick
    this.minViewablePrice = +minTick

    const track: Track = {}
    const ticks: string[] = []
    const prices: { S: Prices; F: Prices } = { S: {}, F: {} }

    const createTick = (book: 'S' | 'F') => {
      const bids = { volume: 0, prices: {} as Record<string, number> }
      const asks = { volume: 0, prices: {} as Record<string, number> }

      return {
        store: { bids, asks },
        create: (): TickData => {
          return {
            status: this.getTickStatus({
              bidsVolume: bids.volume,
              asksVolume: asks.volume
            }),
            asksVolume: asks.volume * this[book].priceFactor,
            bidsVolume: bids.volume * this[book].priceFactor,
            bids: bids.prices,
            asks: asks.prices
          }
        }
      }
    }

    for (let tick = minTick; +tick <= +maxTick; tick = this.tickFormatter.increaseTick(tick)) {
      const store = {
        S: createTick('S'),
        F: createTick('F')
      }

      this.tickFormatter.getPrices(+tick).forEach((__price__) => {
        books.forEach((book) => {
          const price = +this[book].inversePriceFormatter(+__price__)

          prices[book][price] = tick

          const priceIndex = this[book].state.getIndex(price)

          const ask = this[book].state.asks[priceIndex]
          const bid = this[book].state.bids[priceIndex]

          const { asks, bids } = store[book].store

          if (ask) {
            asks.volume += ask[1]
            asks.prices[ask[0]] = ask[1]
          }

          if (bid) {
            bids.volume += bid[1]
            bids.prices[bid[0]] = bid[1]
          }
        })
      })

      track[tick] = {
        S: store.S.create(),
        F: store.F.create()
      }

      ticks.unshift(tick)
    }

    this.viewableTrack = track
    this.viewableTicks = ticks
    this.viewablePrices = prices

    this.onTrackChanged.emit()

    this.trackState = { id: this.trackState.id + 1, isRendered: false }

    if (getScrollTop) {
      this.renderTrack({
        mode: 'top',
        scroll: getScrollTop({ maxPrice: this.maxViewablePrice, prevMaxPrice })
      })
    } else {
      this.renderTrack({
        mode: 'center',
        scroll: this.getPricePosition(this.getMiddlePrice())
      })
    }
  }

  private getTickStatus({ asksVolume: A, bidsVolume: B }: { bidsVolume: number; asksVolume: number }) {
    return A && B ? 'both' : A ? 'asks' : B ? 'bids' : 'free'
  }

  public onScroll() {
    this.getScrollable(({ scrollTop, clientHeight, scrollHeight }) => {
      this.middlePrice = this.getPriceFromTopPosition(scrollTop + clientHeight / 2)

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
      const middlePrice = this.getMiddlePrice()

      if (this.viewState.initialScroll) {
        return
      }

      const ticks = Math.abs(this.middlePrice - middlePrice) / this.tickFormatter.tick

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
        const targetPosition = this.getPricePosition(middlePrice) - clientHeight / 2
        const targetPercent = (targetPosition / (scrollHeight - clientHeight)) * 100

        this.targetScrollPrice = middlePrice

        if (targetPercent > threshold && targetPercent < 100 - threshold) {
          scrollable.moveTo(targetPosition, { effect: 'speed', speed }, () => {
            this.targetScrollPrice = null
          })
        } else {
          const direction = this.middlePrice < middlePrice ? 1 : -1
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

  public setTickStep(tickStep: string) {
    if (this.tickFormatter.changeTick(tickStep)) {
      this.setDefaultView()
      this.onTickChanged.emit()
    }
  }
}
