import { Cog } from '@blueprintjs/icons'
import { OrderBookArbitrageService } from '../../src/dom-arbitrage/service'
import { forwardRef } from 'react'
import { Popover } from '@troovi/uikit'
import { Parameters } from './Parameters'

interface HeaderProps {
  depth: OrderBookArbitrageService
}

export const Header = ({ depth }: HeaderProps) => {
  return (
    <div className="relative">
      <div className="widget-header justify-between">
        <div className="flex items-center gap-10">
          <div>Orderbookx</div>
        </div>
        <Popover arrows placement="bottom" content={() => <Parameters dom={depth} />}>
          {forwardRef((props, ref) => (
            <div
              {...props}
              ref={ref as React.Ref<HTMLDivElement>}
              className="widget-header-button center"
            >
              <Cog size={10} />
            </div>
          ))}
        </Popover>
      </div>
    </div>
  )
}
