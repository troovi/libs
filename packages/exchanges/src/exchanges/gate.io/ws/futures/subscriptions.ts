export const Subscriptions = {
  orderbook(data: { symbol: string; speed: '100ms' | '20ms'; level: '100' | '50' | '20' }) {
    return {
      channel: 'futures.order_book_update',
      event: 'subscribe',
      payload: [data.symbol, data.speed, data.level]
    }
  }
}

export const UnSubscriptions = {
  orderbook(data: { symbol: string; speed: '100ms' | '20ms'; level: '100' | '50' | '20' }) {
    return {
      channel: 'futures.order_book_update',
      event: 'unsubscribe',
      payload: [data.symbol, data.speed, data.level]
    }
  }
}
