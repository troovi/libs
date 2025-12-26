import { useState } from 'react'
import { createState, useLocalState } from '../src/local'

const state = createState<number>(1)

export const LocalTest = () => {
  const increment = () => {
    state.change((value) => value + 1)
  }

  const decrement = () => {
    state.change((value) => value - 1)
  }

  return (
    <div className="main">
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>

      <Listeners />

      <button onClick={() => console.log(state.value)}>GetState</button>
    </div>
  )
}

const Listeners = () => {
  const [listeners, setListeners] = useState<number[]>([0])

  return (
    <div>
      <button onClick={() => setListeners([])}>Destroy listners</button>
      <button onClick={() => setListeners((x) => [...x, x.length])}>Add listner</button>
      <ul>
        {listeners.map((_, i) => (
          <li key={`Listnener-${i}`}>
            <Listnener />
          </li>
        ))}
      </ul>
    </div>
  )
}

const Listnener = () => {
  const value = useLocalState(state)
  return <div>{value}</div>
}
