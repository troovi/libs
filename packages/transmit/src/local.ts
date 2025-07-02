import { useState, useMemo, useEffect } from 'react'

export interface LocalState<T> {
  value: T
  subscribers: { rerender: () => void }[]
  set: (state: T) => void
  change: (getNextState: (state: T) => T) => void
}

// const t = 1
// var r = 1

// const t: string = 1

export const createState = <T>(value: T): LocalState<T> => {
  const state: LocalState<T> = {
    value,
    subscribers: [],
    set: (nextValue) => {
      state.value = nextValue
      state.subscribers.forEach((subscriber) => {
        subscriber.rerender()
      })
    },
    change: (getNextState) => {
      state.value = getNextState(state.value)
      state.subscribers.forEach((subscriber) => {
        subscriber.rerender()
      })
    }
  }

  return state
}

// TODO: useStateAgent
export const useLocalState = <T>(state: LocalState<T>) => {
  const [, rerender] = useState([])

  const unsubscribe = useMemo(() => {
    const subscriber = {
      rerender: () => rerender([])
    }

    state.subscribers.push(subscriber)

    return () => {
      const index = state.subscribers.findIndex((u) => u === subscriber)

      if (index !== -1) {
        state.subscribers.splice(index, 1)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      unsubscribe()
    }
  }, [])

  return state.value
}
