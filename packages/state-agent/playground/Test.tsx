import { useState } from 'react'
import { createSubjectStore, useRerender } from '../src/stores'

const specific = createSubjectStore<{ index: string }>((value) => value.index)

const state = {
  count: 1
}

export const RerenderTest = () => {
  const increment = () => {
    state.count++

    specific({ index: `index-${2}` }).call()
    // subject.rerender()
  }

  const decrement = () => {
    state.count--

    specific({ index: `index-${2}` }).call()
    // subject.rerender()
  }

  return (
    <div className="main">
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>

      <Listeners />

      <button onClick={() => console.log(state)}>GetState</button>
    </div>
  )
}

const Listeners = () => {
  const [listeners, setListeners] = useState<number>(1)

  return (
    <div>
      <button onClick={() => setListeners(0)}>Destroy listners</button>
      <button onClick={() => setListeners((n) => n + 1)}>+ listner</button>
      <button onClick={() => setListeners((n) => n - 1)}>- listner</button>
      <ul>
        listeners: {listeners}
        {listeners > 0 &&
          new Array(listeners).fill('').map((_, i) => (
            <li key={`Listnener-${i}`}>
              {i}: <Listnener i={i} />
            </li>
          ))}
      </ul>
    </div>
  )
}

const Listnener = ({ i }: { i: number }) => {
  // useRerender2(subject)
  useRerender(specific({ index: `index-${i}` }))

  return <span>{state.count}</span>
}
