// import { getPrecisionStep, multiply } from '@troovi/utils-js'
// import { TickFormatter } from '../src/service/tick-formatter'

// const steps = new Array(22).fill(0).map((_, i) => getPrecisionStep(i + 1))

// const generateTicks = (size: number, tickSize: number) => {
//   return new Array<number>(size).fill(0).map((_, i) => multiply(tickSize, i + 1))
// }

// const line2 = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => {
//   const k = (y2 - y1) / (x2 - x1)
//   const b = y1 - k * x1

//   return (x: number) => x * k + b
// }

// for (const priceStep of steps) {
//   console.log('priceStep:', priceStep, '\n')

//   const formatter = new TickFormatter({
//     priceStep: +priceStep
//   })

//   const getSize = line2([formatter.ticksList.filter((x) => +x < 1).length, 100], [1, 10000])

//   formatter.ticksList.forEach((tickStep, i) => {
//     if (+tickStep >= 1) {
//       return
//     }

//     formatter.changeTick(tickStep)

//     const ticks = generateTicks(Math.trunc(getSize(i + 1)), +tickStep)

//     console.log('tick:', tickStep, `(${ticks.length})`)

//     ticks.forEach((tick) => {
//       const prices = formatter.getPrices(tick).map((x) => +x)
//       const range = formatter.getPricesRange(tick)

//       if (range.length === 0 && prices.length !== 0) {
//         console.log('LENGTH:1', { tickStep, priceStep, tick })
//         throw {}
//       }

//       if (range.length === 1 && prices.length !== 1) {
//         console.log('LENGTH:2', { tickStep, priceStep, tick })
//         throw {}
//       }

//       if (prices[0] !== range[0]) {
//         console.log('RANGE:1', { tickStep, priceStep, tick }, prices, range)
//         throw {}
//       }

//       if (prices.length > 1) {
//         if (range[1] !== prices[prices.length - 1]) {
//           console.log('VALUE:2', { tickStep, priceStep, tick }, prices, range)
//           throw {}
//         }
//       }
//     })
//   })

//   console.log('')
// }

// console.log('DONE')
