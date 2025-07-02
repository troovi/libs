import { EventBroadcaster } from '@troovi/utils-js'
import { OrderBookService, roundVolume } from '@troovi/orderbook'

interface Bubble {
  type: 'bubble'
  marginTop: number
  price: number
  quantity: number
  roundedQty: string
  lot: 'sell' | 'buy'
}

interface Angle {
  type: 'angle'
  direction: number
  width: number
  height: number
  marginTop: number
  marginLeft: number
  marginRight: number
  hypotenyse: {
    marginTop: number
    marginLeft: number
    transform: string
    width: number
  }
}

export type PrintEntity = Bubble | Angle

export interface TradeEvent {
  time: number
  isSeller: boolean
  price: string
  quantity: string
}

interface AddOptions {
  price: number
  quantity: number
  lot: 'sell' | 'buy'
}

export class TradesService {
  private maxViewablePrints: number = 18
  public data: TradeEvent[] = []
  public prints: PrintEntity[] = []
  public onRerender = new EventBroadcaster<void>()

  constructor(public dom: OrderBookService) {
    this.dom.onTrackChanged.subscribe(() => {
      this.recalculate()
    })
  }

  public update(events: TradeEvent[]) {
    this.data.unshift(...events.reverse())

    if (this.data.length > 100) {
      this.data = this.data.slice(0, 100)
    }

    if (events.length > this.maxViewablePrints) {
      events = events.slice(events.length - this.maxViewablePrints)
    }

    events.forEach((event) => {
      if (this.prints.length > this.maxViewablePrints) {
        this.prints.shift()
        this.prints.shift()
      }

      this.addPrint({
        price: +event.price,
        quantity: +event.quantity,
        lot: event.isSeller ? 'sell' : 'buy'
      })
    })

    this.onRerender.emit()
  }

  private addPrint({ price, quantity, lot }: AddOptions) {
    const prevPrint = this.prints[this.prints.length - 1]

    const pricePosition = this.dom.getPricePosition(price)
    const roundedQty = roundVolume(quantity)

    if (prevPrint && prevPrint.type === 'bubble' && prevPrint.marginTop !== pricePosition) {
      const R1 = this.getBubbleRadius(prevPrint.roundedQty.length)
      const R2 = this.getBubbleRadius(roundedQty.length)

      const H1 = prevPrint.marginTop
      const H2 = pricePosition

      const distance = H1 - H2

      const direction = Math.sign(distance)
      const top = direction === -1 ? H1 + R1 : H2 + R2

      const width = R1 + R2 + 16
      const height = Math.abs(distance) + (direction === 1 ? R1 - R2 : R2 - R1)

      const hypotinyze = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
      const dgree = Math.atan(height / width) * (180 / Math.PI) * direction * -1

      this.prints.push({
        width,
        height,
        direction,
        type: 'angle',
        marginTop: top,
        marginLeft: -R1,
        marginRight: -R2,
        hypotenyse: {
          marginLeft: ((hypotinyze - width) / 2) * -1,
          marginTop: height / 2,
          width: hypotinyze,
          transform: `rotate(${dgree}deg)`
        }
      })
    }

    this.prints.push({
      type: 'bubble',
      price,
      marginTop: pricePosition,
      quantity,
      roundedQty,
      lot
    })
  }

  getBubbleRadius(length: number) {
    return radiuses[length] ?? 26
  }

  recalculate() {
    const bubbles = this.prints.filter((i) => i.type === 'bubble') as Bubble[]

    this.prints = []

    bubbles.forEach((bubble) => {
      this.addPrint({
        price: bubble.price,
        quantity: bubble.quantity,
        lot: bubble.lot
      })
    })

    this.onRerender.emit()
  }
}

const radiuses: Record<number, number> = {
  1: 9,
  2: 11,
  3: 14,
  4: 18,
  5: 21
}
