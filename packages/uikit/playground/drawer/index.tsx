import { Button } from '@/Button'
import { Drawer, DrawerProps } from '@/Drawer'
import { useState } from 'react'

const direction = ['left', 'top', 'bottom', 'right'] as const

export const DrawerExample = () => {
  return (
    <div className="row-group">
      {direction.map((direction) => (
        <DrawerControlled
          direction={direction}
          key={`drawer-${direction}`}
          size="40%"
          button={<span className="capitalize">{direction} Drawer</span>}
        >
          {() => (
            <div className="flex flex-col overflow-hidden">
              <div className="overflow-y-scroll p-20">
                <b>
                  Data integration is the seminal problem of the digital age. For over ten years, we ve
                  helped the worlds premier organizations rise to the challenge.
                </b>
                <div>
                  Palantir Foundry radically reimagines the way enterprises interact with data by
                  amplifying and extending the power of data integration. With Foundry, anyone can
                  source, fuse, and transform data into any shape they desire. Business analysts become
                  data engineers — and leaders in their organizations data revolution.
                </div>
              </div>
            </div>
          )}
        </DrawerControlled>
      ))}
    </div>
  )
}

interface Props extends Omit<DrawerProps, 'open' | 'onOpenChange' | 'children'> {
  children: (value: { close: () => void }) => JSX.Element
  button: React.ReactNode
}

const DrawerControlled = ({ children, button, ...props }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{button}</Button>
      <Drawer open={open} onOpenChange={setOpen} {...props}>
        {children({ close: () => setOpen(false) })}
      </Drawer>
    </>
  )
}
