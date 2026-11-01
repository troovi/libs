import { createContext, useContext, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { batch, createDerived, createState, useConst, useWatch } from '../src'

/**
 * Песочница: движок из двух ячеек и производной. У каждого компонента — счётчик рендеров: правка имени перерисовывает
 * только поле имени и приветствие, правка количества — поле количества и сумму; кнопки на данные не подписаны.
 */

const createDemo = () => {
  const name = createState('Анна')
  const count = createState(2)
  const price = createState(1500)

  const total = createDerived([count, price], ([count, price]) => count * price)

  return {
    name,
    count,
    price,
    total,
    reset: () => {
      batch(() => {
        name.set('')
        count.set(0)
      })
    }
  }
}

const DemoContext = createContext<ReturnType<typeof createDemo> | null>(null)

const useDemo = () => {
  return useContext(DemoContext)!
}

const Renders = () => {
  const count = useRef(0)

  count.current += 1

  return <small style={{ color: 'gray' }}> · рендеров: {count.current}</small>
}

const NameField = () => {
  const { name } = useDemo()

  const value = useWatch(name)

  return (
    <p>
      <input value={value} onChange={(e) => name.set(e.target.value)} />
      <Renders />
    </p>
  )
}

const CountField = () => {
  const { count } = useDemo()

  const value = useWatch(count)

  return (
    <p>
      <input type="number" value={value} onChange={(e) => count.set(Number(e.target.value))} />
      <Renders />
    </p>
  )
}

const Greeting = () => {
  const { name } = useDemo()

  const isEmpty = useWatch(name, (value) => value.trim() === '')

  return (
    <p>
      {isEmpty ? 'Имя не указано' : 'Имя указано'}
      <Renders />
    </p>
  )
}

const Total = () => {
  const { total } = useDemo()

  const value = useWatch(total)

  return (
    <p>
      Сумма: {value} ₽
      <Renders />
    </p>
  )
}

const Actions = () => {
  const { reset, name, count } = useDemo()

  return (
    <p>
      <button type="button" onClick={reset}>
        Сбросить
      </button>
      <button type="button" onClick={() => console.log({ name: name.get(), count: count.get() })}>
        В консоль
      </button>
      <Renders />
    </p>
  )
}

const App = () => {
  const demo = useConst(createDemo)

  return (
    <DemoContext.Provider value={demo}>
      <NameField />
      <Greeting />
      <CountField />
      <Total />
      <Actions />
    </DemoContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
