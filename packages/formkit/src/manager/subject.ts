export interface Observer<T> {
  callback: (value: T) => void
}

export interface Subject<T> {
  call(value: T): void
  subscribe(observer: Observer<T>): {
    unsubscribe(): void
  }
}

export const createSubject = <T>(): Subject<T> => {
  let ovservers: Observer<T>[] = []

  return {
    call(value) {
      ovservers.forEach(({ callback }) => callback(value))
    },
    subscribe(observer) {
      ovservers.push(observer)

      return {
        unsubscribe() {
          ovservers = ovservers.filter((o) => o !== observer)
        }
      }
    }
  }
}
