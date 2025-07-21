import { truncateNumber, getFloatDigits, normalize, getPrecisionStep, roundUp2 } from '@troovi/utils-js'

// step: 0.1 (range is 0.05)
// 0.1 -> [0.05; 0.15)  or  [0.1 - 0.05, 0.1 + 0.05)
// 0.2 -> [0.15; 0.25)  or  [0.2 - 0.05, 0.2 + 0.05)
// 0.3 -> [0.25; 0.35)  or  [0.3 - 0.05, 0.3 + 0.05)
// ...
// 0.9 -> [0.85; 0,95)  or  [0.9 - 0.05, 0.9 + 0.05)

// step: 5 (range is 2.5)
// 5  -> [2.5; 7.5)
// 10 -> [7.5; 12.5)
// 15 -> [12.5; 17.5)

// calculation example:

// price: 0.41999999
//  step: 0.000001 (range: 0.0000005)

// cuted: 0.419999: [0.4199985; 0.4199995)
// price: 0.41999999 > 0.4199995, so: cuted (0.419999) + step (0.000001) = 0.420000

interface Options {
  priceStep: number
}

export class TickFormatter {
  public tick: number
  public tickPrecision: number

  private range: number
  private rangePrecision: number
  private tickFactor: number
  private tickInt: number

  public priceStep: number
  public pricePrecision: number

  public ticksList: string[] = []
  public tickIndex: number = 0

  constructor({ priceStep }: Options) {
    this.pricePrecision = getFloatDigits(priceStep.toString())
    this.priceStep = priceStep

    this.ticksList = [...this.getFloatingSteps(), '1', '2', '5', '10']
    this.changeTick(this.ticksList[0])
  }

  private getFloatingSteps() {
    const steps: string[] = []

    for (let i = this.pricePrecision; i > 0; i--) {
      steps.push(getPrecisionStep(i, 1), getPrecisionStep(i, 5))
    }

    return steps
  }

  changeTick(tick: string) {
    const index = this.ticksList.findIndex((u) => u === tick)

    if (index !== -1) {
      this.tick = +tick
      this.tickIndex = index
      this.tickPrecision = getFloatDigits(tick)
      this.tickFactor = 10 ** this.tickPrecision
      this.tickInt = Math.round(this.tick * this.tickFactor)

      this.range = this.tick / 2
      this.rangePrecision = getFloatDigits(this.range.toString())

      return true
    }

    return false
  }

  getTick(price: number) {
    const tick = truncateNumber(price, this.tickPrecision)
    const value = +tick
    const tickInt = Math.round(value * this.tickFactor)

    if (tickInt % this.tickInt !== 0) {
      const counts = tickInt / this.tickInt

      const min = normalize(Math.floor(counts) * this.tick, this.tickPrecision)
      const max = normalize(Math.ceil(counts) * this.tick, this.tickPrecision)

      // prettier-ignore
      if (normalize(price - min, this.pricePrecision) >= normalize(max - price, this.pricePrecision)) {
        return max.toFixed(this.tickPrecision)
      }

      return min.toFixed(this.tickPrecision)
    }

    if (this.tickPrecision === this.pricePrecision) {
      return tick
    }

    if (price >= normalize(value + this.range, this.rangePrecision)) {
      return normalize(value + this.tick, this.tickPrecision).toFixed(this.tickPrecision)
    }

    if (price < normalize(value - this.range, this.rangePrecision)) {
      return normalize(value - this.tick, this.tickPrecision).toFixed(this.tickPrecision)
    }

    return tick
  }

  getPrices(tick: number) {
    // если точность tick больше pricePrecision, возвращаем пустой массив
    if (getFloatDigits(tick.toString()) > this.tickPrecision) {
      return []
    }

    // проверка tick на соответствие tickInt значению
    if (Math.round(tick * this.tickFactor) % this.tickInt !== 0) {
      throw `Value is not a tick: ${tick}, ${this.tick}`
    }

    if (this.tick === this.priceStep) {
      return [tick]
    }

    const startRange = normalize(tick - this.range, this.rangePrecision)
    const endRange = normalize(tick + this.range, this.rangePrecision)

    const prices: number[] = [roundUp2(startRange, this.pricePrecision)]

    let price = prices[0]

    while ((price = normalize(price + this.priceStep, this.pricePrecision)) < endRange) {
      prices.push(price)
    }

    return prices
  }

  // extra

  increaseTick(tick: string) {
    return normalize(+tick + this.tick, this.tickPrecision).toFixed(this.tickPrecision)
  }

  getTickStep() {
    return this.ticksList[this.tickIndex]
  }
}
