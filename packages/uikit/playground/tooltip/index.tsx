import { Button } from '@/Button'
import { ButtonGroup } from '@/ButtonGroup'
import { Tooltip } from '@/Tooltip'

export const TooltipExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <Tooltip content={<div>Content Tooltip</div>}>
          <Button>Hover</Button>
        </Tooltip>
        <ButtonGroup>
          <Tooltip content={<div>Each</div>}>
            <Button>Group</Button>
          </Tooltip>
          <Tooltip content={<div>has</div>}>
            <Button>Of</Button>
          </Tooltip>
          <Tooltip content={<div>a tooltip</div>}>
            <Button>Buttons</Button>
          </Tooltip>
        </ButtonGroup>
      </div>
    </div>
  )
}
