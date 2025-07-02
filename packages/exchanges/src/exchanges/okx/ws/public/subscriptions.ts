export const Subscriptions = {
  orderbook(instId: string) {
    return { channel: 'books', instId }
  }
}
