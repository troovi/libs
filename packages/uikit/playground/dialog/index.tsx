import { Button, ButtonProps } from '@/Button'
import { useState } from 'react'
import { Dialog, DialogProps } from '@/Dialog'

export const DialogExample = () => {
  return (
    <div className="row-group">
      <DialogControlled buttonProps={{ text: 'Open dialog' }}>
        {() => (
          <div className="flex flex-col p-20 overflow-hidden">
            <div className="overflow-y-scroll">
              <b>
                Data integration is the seminal problem of the digital age. For over ten years, we ve
                helped the worlds premier organizations rise to the challenge.
              </b>
              <div>
                Palantir Foundry radically reimagines the way enterprises interact with data by
                amplifying and extending the power of data integration. With Foundry, anyone can source,
                fuse, and transform data into any shape they desire. Business analysts become data
                engineers — and leaders in their organizations data revolution.
              </div>
            </div>
            <div className="w-full pt-20">
              <DialogControlled buttonProps={{ fill: true }}>
                {({ close }) => (
                  <div className="p-20">
                    <Button onClick={close}>Close me</Button>
                  </div>
                )}
              </DialogControlled>
            </div>
          </div>
        )}
      </DialogControlled>
      <DialogControlled size="full" buttonProps={{ text: 'Open full-size dialog' }}>
        {() => (
          <div className="flex flex-col h-full justify-between p-20 overflow-hidden">
            <div className="overflow-y-scroll">
              <b>
                Data integration is the seminal problem of the digital age. For over ten years, we ve
                helped the worlds premier organizations rise to the challenge.
              </b>
              <div>
                Palantir Foundry radically reimagines the way enterprises interact with data by
                amplifying and extending the power of data integration. With Foundry, anyone can source,
                fuse, and transform data into any shape they desire. Business analysts become data
                engineers — and leaders in their organizations data revolution.
              </div>
            </div>
            <div className="w-full pt-20">
              <DialogControlled buttonProps={{ fill: true }}>
                {({ close }) => (
                  <div className="p-20">
                    <Button onClick={close}>Close me</Button>
                  </div>
                )}
              </DialogControlled>
            </div>
          </div>
        )}
      </DialogControlled>
    </div>
  )
}

interface Props extends Pick<DialogProps, 'size'> {
  buttonProps?: ButtonProps
  children: (value: { close: () => void }) => JSX.Element
}

const DialogControlled = ({ size, children, buttonProps }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen} size={size}>
        <Dialog.Close className="dialog-close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path
              fill="currentColor"
              d="M14.03 3.03 9.06 8l4.97 4.97-1.061 1.06-4.97-4.97-4.97 4.97-1.06-1.06L6.939 8l-4.97-4.97 1.06-1.06L8 6.94l4.97-4.97z"
            />
          </svg>
        </Dialog.Close>
        {children({ close: () => setOpen(false) })}
      </Dialog>
    </>
  )
}
