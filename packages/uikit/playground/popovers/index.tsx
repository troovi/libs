import { Button } from '@/Button'
import { AnchorTo, Popover } from '@/Popover'
import { RefObject, forwardRef } from 'react'

export const PopoversExample = () => {
  return (
    <div className="docs-popover-placement-example">
      <div className="docs-example-grid">
        <div className="docs-example-grid-1-1" />
        <div className="docs-example-grid-1-2">
          <div style={{ display: 'flex' }}>
            <PlacementPopover placement="bottom start" />
            <PlacementPopover placement="bottom" />
            <PlacementPopover placement="bottom end" />
          </div>
        </div>
        <div className="docs-example-grid-1-3" />
        <div className="docs-example-grid-2-1">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <PlacementPopover placement="right start" />
            <PlacementPopover placement="right" />
            <PlacementPopover placement="right end" />
          </div>
        </div>
        <div className="docs-example-grid-2-2">
          <em>Button positions are flipped here so that all popovers open inward.</em>
        </div>
        <div className="docs-example-grid-2-3">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <PlacementPopover placement="left start" />
            <PlacementPopover placement="left" />
            <PlacementPopover placement="left end" />
          </div>
        </div>
        <div className="docs-example-grid-3-1" />
        <div className="docs-example-grid-3-2">
          <div style={{ display: 'flex' }}>
            <PlacementPopover placement="top start" />
            <PlacementPopover placement="top" />
            <PlacementPopover placement="top end" />
          </div>
        </div>
        <div className="docs-example-grid-3-3" />
      </div>
    </div>
  )
}

const PlacementPopover = ({ placement }: { placement: AnchorTo }) => {
  return (
    <Popover
      className="w-full"
      arrows
      placement={placement}
      content={() => (
        <div className="text-white p-12">
          <div>Popover content 1</div>
          <div>Popover content 2</div>
        </div>
      )}
    >
      {forwardRef((props, ref) => {
        return (
          <Button fill {...props} ref={ref as RefObject<HTMLButtonElement>}>
            {placement}
          </Button>
        )
      })}
    </Popover>
  )
}
