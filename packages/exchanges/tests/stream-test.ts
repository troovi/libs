import exchanges from './books-exchanges.json'
import { sleep } from '@troovi/utils-js'
import { BinancePublicStream } from '../src/exchanges/binance'

const stream = new BinancePublicStream('spot', {
  onBroken(channels) {
    console.log('broken:', channels)
  },
  onMessage: (data) => {
    // console.log('message')
  }
})

const spot = exchanges.binance.spot.splice(0, 100)

const subscribe = (channels: string[]) => {
  return stream
    .subscribe(({ kline }) => {
      return channels.map((symbol) => kline({ symbol, interval: '5m' }))
    })
    .then(() => {
      console.log('subscribed')

      for (const connectionID in stream.network.connections) {
        console.log(connectionID, stream.network.connections[connectionID].subscriptions)
      }
    })
}

const unsubscribe = (channels: string[]) => {
  return stream
    .unsubscribe(({ kline }) => {
      return channels.map((symbol) => kline({ symbol, interval: '5m' }))
    })
    .then(() => {
      console.log('unsubscribe')

      for (const connectionID in stream.network.connections) {
        console.log(connectionID, stream.network.connections[connectionID].subscriptions)
      }
    })
}

/**
 *
 * Тест 1
 * Проверка выполнения одной подписки на большой список
 *
 */

// subscribe(spot).then(() => {
//   console.log('subscribed!')
// })

/**
 *
 * Тест 2
 * Параллельные подписки
 *
 */

// subscribe(spot.splice(0, 8))
// subscribe(spot.splice(8, 10))
// subscribe(spot.splice(10, 25))

/**
 *
 * Тест 3
 * Тест на неравномерное распределение каналов
 *
 */

// const P1 = [...spot].splice(0, 10)
// const P2 = [...spot].splice(10, 10)
// const P3 = [...spot].splice(20, 10)

// Promise.all([subscribe(P1), subscribe(P2)]).then(() => {
//   Promise.all([unsubscribe([P1[0], P1[1]]), unsubscribe([P2[1]])]).then(() => {
//     console.log('=================== DONE ===================')
//     subscribe(P3).then(() => {
//       console.log('END')
//     })
//   })
// })

/**
 *
 * Тест 4
 * Проверка
 *
 */

// subscribe([
//   Subscriptions.kline({ symbol: 'BTCUSDT', interval: '5m' }),
//   Subscriptions.kline({ symbol: 'BNBUSDT', interval: '5m' }),
//   Subscriptions.kline({ symbol: 'ETHUSDT', interval: '5m' })
// ]).then(() => {
//   subscribe([
//     Subscriptions.kline({ symbol: 'XRPUSDT', interval: '5m' }),
//     Subscriptions.kline({ symbol: 'SOLUSDT', interval: '5m' })
//   ])

//   // unsubscribing

//   sleep(5000).then(() => {
//     console.log('start unsubscribing')

//     unsubscribe([Subscriptions.kline({ symbol: 'BTCUSDT', interval: '5m' })]).then(() => {
//       sleep(1500).then(() => {
//         unsubscribe([
//           Subscriptions.kline({ symbol: 'BNBUSDT', interval: '5m' }),
//           Subscriptions.kline({ symbol: 'ETHUSDT', interval: '5m' })
//         ]).then(() => {
//           sleep(1500).then(() => {
//             unsubscribe([Subscriptions.kline({ symbol: 'XRPUSDT', interval: '5m' })]).then(() => {
//               sleep(1500).then(() => {
//                 unsubscribe([Subscriptions.kline({ symbol: 'SOLUSDT', interval: '5m' })])
//               })
//             })
//           })
//         })
//       })
//     })
//   })
// })
