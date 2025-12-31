import { Button } from '@/Button'
import { Popovers } from './registry'

export const PopoverRegistries = () => {
  return (
    <>
      <div className="row-group">
        <Popovers.Popover1 data={{ name: 'Pavel', surname: 'Victorov' }}>
          <Button>Popover 1#1</Button>
        </Popovers.Popover1>
        <Popovers.Popover1 minimal sideOffset={0} data={{ name: 'Pavel', surname: 'Victorov' }}>
          <Button>Popover 1#2</Button>
        </Popovers.Popover1>
        <Popovers.Popover2 showArrows side="top" data={{ age: 20, birthday: new Date() }}>
          <Button>Popover 2</Button>
        </Popovers.Popover2>
        <Popovers.Popover3>
          <div>Click</div>
        </Popovers.Popover3>
      </div>
    </>
  )
}
