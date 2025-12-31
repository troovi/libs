import { Button, DialogShell, PopupProps } from '@/index'

interface Dialog2Props {
  age: number
  birthday: Date
}

export default ({ close, data }: PopupProps<Dialog2Props>) => {
  return (
    <DialogShell size="l" disableEsc>
      <div>
        <div>age: {data.age}</div>
        <div>birthday: {data.birthday.toISOString()}</div>
        <div className="p-20">
          <Button onClick={close}>Close me</Button>
        </div>
      </div>
    </DialogShell>
  )
}
