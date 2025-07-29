import { broker } from './broker'

broker.subscribe({
  exchange: 'orangex',
  market: 'spot',
  stream: 'kline',
  symbol: 'BTC-USDT-PERPETUAL',
  interval: '1m'
})

broker.onEvent((e) => {
  console.log(e.event)
})
