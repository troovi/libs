export const Subscriptions = {
  orderbook: (data: { instType: 'USDT-FUTURES' | 'SPOT'; instId: string }) => {
    return {
      instType: data.instType,
      channel: 'books',
      instId: data.instId
    }
  }
}
