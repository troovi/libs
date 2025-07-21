// import { InspectPerfomance } from '@troovi/utils-nodejs'
// import { getFloatDigits, getPrecisionStep, normalize } from '@troovi/utils-js'
// import { TickFormatter } from '../src/service/tick-formatter'
// import { TickFormatter2 } from '../src/service/tick-formatter-2'

// const steps = new Array(22).fill(0).map((_, i) => getPrecisionStep(i))

// const generatePrices = (size: number, priceStep: number) => {
//   const precision = getFloatDigits(priceStep.toString())
//   return new Array<number>(size).fill(0).map((_, i) => normalize(priceStep * (i + 1), precision))
// }

// for (const priceStep of steps) {
//   console.log('priceStep:', priceStep, '\n')

//   const formatter = new TickFormatter({ priceStep: +priceStep })
//   const formatter2 = new TickFormatter2({ priceStep: +priceStep })

//   const prices = generatePrices(10000000, +priceStep)

//   formatter.ticksList.forEach((tickStep) => {
//     formatter.changeTick(tickStep)
//     formatter2.changeTick(tickStep)

//     console.log('tick:', tickStep)

//     const r1metric = new InspectPerfomance('r1')

//     r1metric.start()
//     const r1 = prices.map((price) => ({ tick: formatter.getTick(price), price }))
//     r1metric.done()

//     const r2metric = new InspectPerfomance('r2')

//     r2metric.start()
//     const r2 = prices.map((price) => ({ tick: formatter2.getTick(price), price }))
//     r2metric.done()

//     if (r1.length !== r2.length) {
//       console.log('size not equal:', r1.length, r2.length)
//       throw {}
//     }

//     r1.forEach((_, i) => {
//       if (r1[i].tick !== r2[i].tick) {
//         if (+r1[i].tick <= 0) {
//           return
//         }

//         console.log('FAIL', r1[i], r2[i])
//         throw {}
//       }
//     })
//   })

//   console.log('')
// }

// console.log('DONE')
