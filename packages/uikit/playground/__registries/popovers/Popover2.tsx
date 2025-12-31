import { Button, PopoverContentProps } from '@/index'

export interface Popover2Props {
  age: number
  birthday: Date
}

export default ({ data, close }: PopoverContentProps<Popover2Props>) => {
  return (
    <div>
      <div>age: {data.age}</div>
      <div>birthday: {data.birthday.toISOString()}</div>
      <Button size="sm" onClick={close}>
        Close
      </Button>
    </div>
  )
}
