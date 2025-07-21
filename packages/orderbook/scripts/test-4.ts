// import { InspectPerfomance } from '@troovi/utils-nodejs'
// import { getFloatDigits, multiply, normalize } from '@troovi/utils-js'
// import { writeFileSync } from 'fs'

// const fix = (value: number, precision: number) => {
//   const [intPart, decPart = ''] = value.toString().split('.')
//   return intPart + '.' + decPart.padEnd(precision, '0')
// }

// const fix2 = (value: number, precision: number) => {
//   let str = value + ''
//   let dot = -1
//   const len = str.length

//   // Найти позицию точки вручную (быстрее split)
//   for (let i = 0; i < len; i++) {
//     if (str.charCodeAt(i) === 46) {
//       dot = i
//       break
//     }
//   }

//   if (dot === -1) {
//     // Целое число, просто добавляем .000...
//     return str + '.' + '0'.repeat(precision)
//   }

//   const decimals = len - dot - 1

//   if (decimals === precision) {
//     return str
//   }

//   return str + '0'.repeat(precision - decimals)
// }

// const generatePrices = (size: number, priceStep: number) => {
//   const precision = getFloatDigits(priceStep.toString())
//   return new Array<number>(size).fill(0).map((_, i) => normalize(priceStep * (i + 1), precision))
// }

// const prices = generatePrices(1000000, 0.0001)

// writeFileSync('mo.json', JSON.stringify(prices))
// // console.log('start')
// // const test1 = new InspectPerfomance('test1')

// // test1.start()
// // prices.forEach((value) => value.toFixed(2))
// // test1.done()

// // const test2 = new InspectPerfomance('test2')

// // test2.start()
// // prices.forEach((value) => fix2(value, 2))
// // test2.done()
