import { ScrollAnimation } from '@troovi/utils-browser'
import { EventBroadcaster, minus, multiply, normalize, plus } from '@troovi/utils-js'
import { createState } from '@troovi/transmit'

import { TickFormatter } from './service/tick-formatter'
import { OrderBookState, OrderBookUpdate } from './service/orderbook'

export interface TickData {
  status: 'free' | 'bids' | 'asks' | 'both'
  bidsVolume: number
  asksVolume: number
  bids: {
    [price: string]: number
  }
  asks: {
    [price: string]: number
  }
}

export interface Track {
  [tick: string]: TickData
}

interface Options {
  snapshot: OrderBookUpdate
}

export type InitialScroll = { position: number; mode: 'center' } | { shift: number; mode: 'frame' }

interface DOMViewState {
  updateId: number
  track: Track
  ticks: string[]
  initialScroll?: InitialScroll
}

export class OrderBookService {
  public tickHeight: number = 18
  public maxTicks: number = 140

  public viewState: DOMViewState = {
    updateId: 0,
    track: {},
    ticks: []
  }

  // state

  private readonly limits: {
    maxPrice: number
    minPrice: number
  }

  // prices

  private maxViewablePrice: number
  private minViewablePrice: number

  // current

  private isTrackBuilding: boolean = false

  private middlePrice: number
  private viewableTrack: Track = {}
  private viewableTicks: string[] = []
  private viewablePrices: { [price: number]: string } = {}

  // scroll

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

  constructor(public state: OrderBookState, { snapshot }: Options) {
    this.state.update(snapshot)

    this.tickFormatter = new TickFormatter({ priceStep: state.priceStep })

    this.bestBid = createState(this.state.best.bids)
    this.bestAsk = createState(this.state.best.asks)

    this.limits = {
      maxPrice: Math.max(...this.getEdgePrices(snapshot.asks)),
      minPrice: Math.min(...this.getEdgePrices(snapshot.bids))
    }

    this.state.onBestBidChange.subscribe((price) => {
      this.bestBid.set(price)
    })

    this.state.onBestAskChange.subscribe((price) => {
      this.bestAsk.set(price)
    })

    this.basevolume = this.getAvgVolumes(snapshot)
  }

  private getEdgePrices(orders: [number, number][]) {
    return [orders[0][0], orders[orders.length - 1][0]]
  }

  public setDefaultView() {
    this.middlePrice = this.state.best.bids
    this.rebuildTrack()
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

    this.state.update(update, ({ side, price, quantity }) => {
      const tick = this.viewableTrack[this.viewablePrices[price]]

      if (tick) {
        // update tick

        if (quantity) {
          tick[side][price] = quantity
        } else {
          delete tick[side][price]
        }

        tick[`${side}Volume`] = this.getClusterVolume(tick[side])
        tick.status = this.getTickStatus(tick)
      }
    })

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

  // only in hook usage
  public onTrackRendered() {
    this.isTrackBuilding = false
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
    console.time('track')

    this.isTrackBuilding = true

    const tickStep = this.tickFormatter.tick
    const middlePrice = +this.tickFormatter.getTick(this.middlePrice)

    const prevMaxPrice = this.maxViewablePrice

    this.maxViewablePrice = plus(middlePrice, multiply(tickStep, this.maxTicks / 2))
    this.minViewablePrice = minus(middlePrice, multiply(tickStep, this.maxTicks / 2 - 1))

    const maxTick = this.tickFormatter.getTick(middlePrice + (tickStep * this.maxTicks) / 2)
    const minTick = this.tickFormatter.getTick(middlePrice - (tickStep * this.maxTicks) / 2)

    const track: Track = {}
    const ticks: string[] = []
    const prices: { [price: number]: string } = {}

    for (let tick = minTick; +tick <= +maxTick; tick = this.tickFormatter.increaseTick(tick)) {
      const bids = { volume: 0, prices: {} as Record<string, number> }
      const asks = { volume: 0, prices: {} as Record<string, number> }

      this.tickFormatter.getPrices(+tick).forEach((price) => {
        prices[price] = tick

        const priceIndex = this.state.getIndex(price)

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

    if (ticks.length !== this.maxTicks) {
      console.warn(`Ticks size unexpected: ${ticks.length}`)
    }

    this.viewableTrack = track
    this.viewableTicks = ticks
    this.viewablePrices = prices

    console.timeEnd('track')

    this.onTrackChanged.emit()

    this.trackState = {
      id: this.trackState.id + 1,
      isRendered: false
    }

    if (getScrollTop) {
      this.render({
        mode: 'frame',
        shift: getScrollTop({ maxPrice: this.maxViewablePrice, prevMaxPrice })
      })
    } else {
      this.render({
        mode: 'center',
        position: this.getPricePosition(this.middlePrice)
      })
    }
  }

  private getTickStatus({ asksVolume: A, bidsVolume: B }: { bidsVolume: number; asksVolume: number }) {
    return A && B ? 'both' : A ? 'asks' : B ? 'bids' : 'free'
  }

  public onScroll() {
    this.getScrollable(({ scrollTop, clientHeight, scrollHeight }) => {
      this.middlePrice = this.getPriceFromTopPosition(scrollTop + clientHeight / 2)

      if (this.viewState.initialScroll || this.isTrackBuilding) {
        return
      }

      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100

      // top
      if (progress <= this.trackThreshold) {
        if (this.maxViewablePrice < this.limits.maxPrice) {
          this.rebuildTrack(({ prevMaxPrice, maxPrice }) => {
            const counts = normalize(
              (maxPrice - prevMaxPrice) / this.tickFormatter.tick,
              this.tickFormatter.tickPrecision
            )

            return counts * this.tickHeight
          })
        }
      }

      // bottom
      if (progress >= 100 - this.trackThreshold) {
        if (this.minViewablePrice > this.limits.minPrice) {
          this.rebuildTrack(({ prevMaxPrice, maxPrice }) => {
            const counts = normalize(
              (prevMaxPrice - maxPrice) / this.tickFormatter.tick,
              this.tickFormatter.tickPrecision
            )

            return counts * this.tickHeight * -1
          })
        }
      }
    })
  }

  public scrollToCenter(speedValue?: number) {
    this.getScrollable(({ clientHeight, scrollHeight }, scrollable) => {
      const bestBid = this.state.best.bids
      const ticks = Math.abs(this.middlePrice - bestBid) / this.tickFormatter.tick

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
        // значение позиции middlePrice по центру экрана
        const targetPosition = this.getPricePosition(bestBid) - clientHeight / 2
        // процент прогресса позиции targetPosition относительно scrollHeight (доступного трека)
        // 100% - цель в самом вверху трека. 0% - в самом низу, 50% - посередине трека. Если больше 100% или меньше 0%, то целевая позиция вне текущего трека
        const targetPercent = (targetPosition / (scrollHeight - clientHeight)) * 100

        this.targetScrollPrice = bestBid

        // если целевая позиция находится внутри текущего трека:
        // (необходимо учесть threshold, так как новый трек создается когда прогесс прокрутки достигает одной из границ стакана, с учетом threshold. Если не учитывать это, то целевая позиция прокрутки может пересекать значение, когда будет создан новый трек)
        if (targetPercent > threshold && targetPercent < 100 - threshold) {
          // выполняем операцию скорлла прямо до нее
          scrollable.moveTo(targetPosition, { effect: 'speed', speed }, () => {
            this.targetScrollPrice = null
          })
        } else {
          // в противном случае, разделяем выполнение между несколькими треками
          const direction = this.middlePrice < bestBid ? 1 : -1
          const percent = direction === 1 ? threshold - 0.1 : 100 - threshold + 0.1
          // преобразование процентов в значение scrollTop
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

  private getAvgVolumes(snapshot: OrderBookUpdate) {
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

    return Math.round(vol)
  }

  public setTickStep(tickStep: string) {
    if (this.tickFormatter.changeTick(tickStep)) {
      this.setDefaultView()
      this.onTickChanged.emit()
    }
  }
}
