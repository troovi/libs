import { ByBitApi } from '../src/exchanges/bybit/api/api'
import { broker } from './broker'

// broker.subscribe({
//   exchange: 'orangex',
//   market: 'spot',
//   stream: 'kline',
//   symbol: 'BTC-USDT-PERPETUAL',
//   interval: '1m'
// })

// broker.onEvent((e) => {
//   console.log(e.event)
// })
const api = new ByBitApi({
  apiKey: '0vuO1baak6kuf6ZWk1',
  apiSecret: 'tFiKlxoSY5jWVY9AN4EOsYxQyxBVIELWEmAt'
})

api.getFeeRate({ category: 'linear', symbol: '1000000BABYDOGEUSDT' }).then((m) => {
  console.log(m)
})
