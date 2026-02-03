import { Button, ButtonGroup, NowContextProvider, useNow } from '@/index'
import { useRef, useState } from 'react'

export const NowExample = () => {
  return (
    <NowContextProvider>
      <div className="col-group">
        <NowTickers />
      </div>
    </NowContextProvider>
  )
}

const NowTickers = () => {
  const [count, setCount] = useState(1)

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-18">
        {new Array(count).fill(0).map((i) => (
          <NowTicker key={`item-${i}`} interval={1000} />
        ))}
      </div>
      <ButtonGroup>
        <Button onClick={() => setCount((count) => count - 1)}>-</Button>
        <Button onClick={() => setCount((count) => count + 1)}>+</Button>
      </ButtonGroup>
    </div>
  )
}

const NowTicker = ({ interval }: { interval: number }) => {
  const ref = useRef(0)
  useNow(interval)

  ref.current++

  return (
    <div>
      <div>interval: {interval}</div>
      <div>{ref.current}</div>
    </div>
  )
}
