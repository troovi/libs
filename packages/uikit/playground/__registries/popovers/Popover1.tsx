import { Button, PopoverContentProps } from '@/index'

export interface Popover1Props {
  surname: string
  name: string
}

export default ({ data, close }: PopoverContentProps<Popover1Props>) => {
  return (
    <div>
      <div>name: {data.name}</div>
      <div>surname: {data.surname}</div>
      <Button size="sm" onClick={close}>
        Close
      </Button>
    </div>
  )
}
