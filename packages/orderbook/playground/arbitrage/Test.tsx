import data from './snapshot.json'

import { OrderBookArbitrageService } from '../../src/dom-arbitrage/service'
import { OrderBookArbitrage } from '../../src/dom-arbitrage/OrderBook'
import { OrderBookOptions } from '../../src'

export const TestArbitrage = () => {
  const depth = new OrderBookArbitrageService(data.spot as OrderBookOptions)

  return (
    <div className="h-full p-10 overflow-hidden">
      <div className="flex h-full flex-col overflow-hidden">
        <OrderBookArbitrage className="window" depth={depth} />
      </div>
    </div>
  )
}
