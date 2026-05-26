export class EventEmmiter<T> {
  public store: Record<string, ((data: T) => void)[]> = {}

  emit(event: string | number, data: T) {
    if (this.store[event]) {
      this.store[event].forEach((callback) => callback(data))
    }
  }

  subscribe(event: string | number, callback: (data: T) => void) {
    if (!this.store[event]) {
      this.store[event] = []
    }

    this.store[event].push(callback)

    return () => {
      this.unsubscribe(event, callback)
    }
  }

  unsubscribe(event: string | number, callback: (data: T) => void) {
    if (this.store[event]) {
      const index = this.store[event].findIndex((u) => u === callback)

      if (index !== -1) {
        this.store[event].splice(index, 1)

        if (this.store[event].length === 0) {
          delete this.store[event]
        }
      }
    }
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
