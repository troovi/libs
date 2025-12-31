import { Button, DialogShell, PopupProps } from '@/index'

interface Dialog1Props {
  name: string
  surname: string
}

export default ({ close, data }: PopupProps<Dialog1Props>) => {
  return (
    <DialogShell size="m">
      <div>
        <div>{data.name}</div>
        <div>{data.surname}</div>
        <div className="p-20">
          <Button onClick={close}>Close me</Button>
        </div>
      </div>
    </DialogShell>
  )
}
