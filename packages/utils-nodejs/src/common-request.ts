import { EventBroadcaster } from '@troovi/utils-js'

export const CommonRequest = <T>(request: () => Promise<T>) => {
  const state = { isLoading: false }
  const subscribers = new EventBroadcaster<T>()

  return (): Promise<T> => {
    if (!state.isLoading) {
      state.isLoading = true

      return request().then((value) => {
        state.isLoading = false
        subscribers.emit(value)

        return value
      })
    }

    return new Promise<T>((resolve) => {
      const unsubscribe = subscribers.subscribe((value) => {
        unsubscribe()
        resolve(value)
      })
    })
  }
}
