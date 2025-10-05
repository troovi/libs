import { EventBroadcaster } from '@troovi/utils-js'

export class CommonResource<T> {
  private isLoading: boolean = false
  private subscribers = new EventBroadcaster<T>()

  request(getData: () => Promise<T>): Promise<T> {
    if (!this.isLoading) {
      this.isLoading = true

      return getData().then((value) => {
        this.isLoading = false
        this.subscribers.emit(value)

        return value
      })
    }

    return new Promise<T>((resolve) => {
      const unsubscribe = this.subscribers.subscribe((value) => {
        unsubscribe()
        resolve(value)
      })
    })
  }
}
