import { Button } from '@/Button'
import { Popover, PopoverProps } from '@/Popover'
import { useState } from 'react'

export const PopoversExample = () => {
  const [minimal] = useState(false)
  const [arrows] = useState(true)

  return (
    <div className="docs-popover-placement-example">
      <div className="docs-example-grid">
        <div className="docs-example-grid-1-1" />
        <div className="docs-example-grid-1-2">
          <div style={{ display: 'flex', gap: '10px' }}>
            <PlacementPopover side="bottom" align="start" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="bottom" align="center" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="bottom" align="end" minimal={minimal} showArrows={arrows} />
          </div>
        </div>
        <div className="docs-example-grid-1-3" />
        <div className="docs-example-grid-2-1">
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <PlacementPopover side="right" align="start" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="right" align="center" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="right" align="end" minimal={minimal} showArrows={arrows} />
          </div>
        </div>
        <div className="docs-example-grid-2-2">
          <em>Button positions are flipped here so that all popovers open inward.</em>
        </div>
        <div className="docs-example-grid-2-3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PlacementPopover side="left" align="start" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="left" align="center" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="left" align="end" minimal={minimal} showArrows={arrows} />
          </div>
        </div>
        <div className="docs-example-grid-3-1" />
        <div className="docs-example-grid-3-2">
          <div style={{ display: 'flex', gap: '10px' }}>
            <PlacementPopover side="top" align="start" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="top" align="center" minimal={minimal} showArrows={arrows} />
            <PlacementPopover side="top" align="end" minimal={minimal} showArrows={arrows} />
          </div>
        </div>
        <div className="docs-example-grid-3-3" />
      </div>
    </div>
  )
}

const PlacementPopover = (props: Omit<PopoverProps, 'content' | 'children'>) => {
  return (
    <Popover
      {...props}
      // sideOffset={0}

      content={() => (
        <div className="p-12">
          <div>Popover content: {props.align}</div>
          <div>Popover content: {props.side}</div>
        </div>
      )}
    >
      <Button fill>
        {props.side} {props.align}
      </Button>
    </Popover>
  )
}
