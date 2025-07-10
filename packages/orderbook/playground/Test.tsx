import data from './snapshot.json'

import { OrderBook } from '../src/OrderBook'
import { OrderBookService, OrderBookOptions } from '../src/dom'
// import { Header } from './Header'

export const TestSingle = () => {
  const depth1 = new OrderBookService(data as unknown as OrderBookOptions)

  return (
    <div className="h-full p-10 overflow-hidden">
      <div className="flex h-full overflow-hidden gap-6 justify-center">
        <OrderBook className="window" depth={depth1} />
      </div>
    </div>
  )
}
