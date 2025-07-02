export class EventDispatcher<T> {
  private subscribers: Record<string, (data: T) => void> = {}

  emit(key: string, data: T) {
    if (this.subscribers[key]) {
      this.subscribers[key](data)
    }
  }

  on(key: string, callback: (data: T) => void) {
    this.subscribers[key] = callback
  }

  rm(key: string) {
    delete this.subscribers[key]
  }
}

export class EventBroadcaster<T> {
  public subscribers: ((data: T) => void)[] = []

  emit(data: T) {
    this.subscribers.forEach((callback) => {
      callback(data)
    })
  }

  subscribe(callback: (data: T) => void) {
    this.subscribers.push(callback)

    return () => {
      this.unsubscribe(callback)
    }
  }

  unsubscribe(callback: (data: T) => void) {
    const index = this.subscribers.findIndex((u) => u === callback)

    if (index !== -1) {
      this.subscribers.splice(index, 1)
    }
  }
}
