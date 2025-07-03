import { Minus, Plus } from '@blueprintjs/icons'
import { useState } from 'react'
import { Button } from '@troovi/uikit'
import { OrderBookArbitrageService } from '../../src/dom-arbitrage/service'

interface Props {
  dom: OrderBookArbitrageService
}

export const Parameters = ({ dom }: Props) => {
  const [, rerender] = useState([])

  const onStepChange = (move: 1 | -1) => {
    const nextTick = dom.tickFormatter.ticksList[dom.tickFormatter.tickIndex + move]

    if (nextTick) {
      dom.setTickStep(nextTick)
      rerender([])
    }
  }

  // const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (dom.basevolume) {
  //     const value = +e.target.value
  //     dom.basevolume = !value ? 1 : value
  //     dom.onRerender?.()
  //   }
  // }

  return (
    <div className="flex flex-col gap-12 p-10">
      <div>
        <div className="quieter mb-8 text-white">Step size</div>
        <div className="flex items-center gap-10">
          <div className="input">{dom.tickFormatter.ticksList[dom.tickFormatter.tickIndex]}</div>
          <div className="flex gap-6">
            <Button
              icon={<Plus />}
              className="cursor-pointer"
              style={{ padding: '6px' }}
              onClick={() => onStepChange(1)}
            />
            <Button
              icon={<Minus />}
              className="cursor-pointer"
              style={{ padding: '6px' }}
              onClick={() => onStepChange(-1)}
            />
          </div>
        </div>
      </div>
      {/* <div>
        <div className="quieter mb-8 text-white">Max volume fill</div>
        <Input onChange={onInput} defaultValue={dom.basevolume} placeholder="Volume" />
      </div> */}
    </div>
  )
}
