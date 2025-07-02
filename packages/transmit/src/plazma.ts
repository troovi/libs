import { useState, useMemo, useEffect } from 'react'

interface Observer {
  callback: () => void
}

interface Subject {
  call(): void
  subscribe(observer: Observer): {
    unsubscribe(): void
  }
}

export const createSubjectStore = <N>(getName: (props: N) => string) => {
  const store: Record<string, Subject> = {}

  return (value: N) => {
    const name = getName(value)

    if (!store[name]) {
      store[name] = createSubject()
    }

    return store[name]
  }
}

export const createSubject = (): Subject => {
  let ovservers: Observer[] = []

  return {
    call() {
      ovservers.forEach(({ callback }) => callback())
    },
    subscribe(observer: Observer) {
      ovservers.push(observer)

      return {
        unsubscribe() {
          ovservers = ovservers.filter((o) => o !== observer)
        }
      }
    }
  }
}

export const useRerender = (subject: Subject) => {
  const [, rerender] = useState([])

  const { unsubscribe } = useMemo(() => {
    return subject.subscribe({
      callback: () => rerender([])
    })
  }, [])

  useEffect(() => {
    return () => unsubscribe()
  }, [])
}

export const rerender = (subject: Subject) => {
  subject.call()
}
