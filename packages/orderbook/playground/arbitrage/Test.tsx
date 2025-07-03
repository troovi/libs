import data from './snapshot.json'

import { OrderBookArbitrageService, OrderBookOptions } from '../../src/dom-arbitrage/service'
import { OrderBookArbitrage } from '../../src/dom-arbitrage/OrderBook'
import { Header } from './Header'

export const TestArbitrage = () => {
  const depth1 = new OrderBookArbitrageService(data as OrderBookOptions)

  return (
    <div className="h-full p-10 overflow-hidden">
      <div className="flex h-full overflow-hidden gap-6 justify-center">
        <OrderBookArbitrage className="window" depth={depth1} Header={<Header depth={depth1} />} />
      </div>
    </div>
  )
}
