export const Subscriptions = {
  depth(symbol: string) {
    return { method: 'sub.depth', param: { symbol } }
  }
}

export const UnSubscribtions = {
  depth(symbol: string) {
    return { method: 'unsub.depth', param: { symbol } }
  }
}
