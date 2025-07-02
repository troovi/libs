export const Subscriptions = {
  orderbook(symbol: string) {
    return {
      channel: 'spot.order_book_update',
      event: 'subscribe',
      payload: [symbol, '100ms'] // 100ms | 20ms
    }
  }
}

export const UnSubscriptions = {
  orderbook(symbol: string) {
    return {
      channel: 'spot.order_book_update',
      event: 'unsubscribe',
      payload: [symbol, '100ms'] // 100ms | 20ms
    }
  }
}
