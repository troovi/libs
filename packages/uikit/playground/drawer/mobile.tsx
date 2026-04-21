import { Button } from '@/Button'
import { MobileDrawer, MobileDrawerProps } from '@/DrawerMobile'
import { FormGroup } from '@/FormGroup'
import { Input } from '@/Input/Input'
import { TextArea } from '@/TextArea'
import { useState } from 'react'

export const DrawerMobileExample = () => {
  return (
    <div className="row-group">
      <DrawerControlled button="Basic MobileDrawer" size="65%">
        {({ close }) => (
          <div className="flex h-full flex-col gap-16 px-20 pb-20">
            <div>
              <div className="text-lg font-medium">Bottom sheet with Vaul-style drag</div>
              <div className="text-secondary">
                Drag the sheet down from anywhere to dismiss it, or pull it slightly up to feel the same
                damped resistance as in Vaul.
              </div>
            </div>
            <div className="flex-1 rounded-8 border border-default p-16">
              The mobile drawer now uses a compound API with `Root`, `Portal`, `Overlay`, `Content` and
              `Handle`, while keeping our existing visual styles.
            </div>
            <div className="flex justify-end">
              <Button onClick={close}>Close</Button>
            </div>
          </div>
        )}
      </DrawerControlled>
      <DrawerControlled button="Scrollable MobileDrawer" size="75%">
        {({ close }) => (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="px-20 pb-12">
              <div className="text-lg font-medium">Scrollable content</div>
              <div className="text-secondary">
                Scroll the body first, then drag down once the scroll area is back at the top.
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto px-20 pb-20 pt-0"
              data-mobile-drawer-scrollable="true"
              data-vaul-drawer-scrollable="true"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  className="mb-12 rounded-8 border border-default p-16"
                  key={`drawer-item-${index}`}
                >
                  <b>Section {index + 1}</b>
                  <div>
                    Data integration is the seminal problem of the digital age. Foundry reimagines how
                    teams source, fuse, and transform data into products and workflows.
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end px-20 pb-20 pt-12">
              <Button onClick={close}>Close</Button>
            </div>
          </div>
        )}
      </DrawerControlled>
      <DrawerControlled button="Inputs MobileDrawer" size="80%">
        {({ close }) => (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="px-20 pb-12">
              <div className="text-lg font-medium">Drawer with inputs</div>
              <div className="text-secondary">
                This variant uses `handleOnly`, so dragging is limited to the top handle and form
                controls stay easy to interact with.
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto px-20 pb-20 pt-0"
              data-mobile-drawer-scrollable="true"
              data-vaul-drawer-scrollable="true"
            >
              <div className="col-group">
                <FormGroup label="Full name">
                  <Input placeholder="Jane Doe" />
                </FormGroup>
                <FormGroup label="Email">
                  <Input placeholder="jane@company.com" />
                </FormGroup>
                <FormGroup label="Notes">
                  <TextArea
                    fill
                    grow
                    placeholder="Share a few details"
                    style={{ minHeight: '160px' }}
                  />
                </FormGroup>
              </div>
            </div>
            <div className="flex justify-end px-20 pb-20 pt-12">
              <Button onClick={close}>Submit</Button>
            </div>
          </div>
        )}
      </DrawerControlled>
    </div>
  )
}

interface Props extends Omit<MobileDrawerProps, 'open' | 'onOpenChange' | 'children'> {
  children: (value: { close: () => void }) => JSX.Element
  button: React.ReactNode
}

const DrawerControlled = ({ children, button, ...props }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>{button}</Button>
      <MobileDrawer open={open} onOpenChange={setOpen} {...props}>
        <MobileDrawer.Handle />
        {children({ close: () => setOpen(false) })}
      </MobileDrawer>
    </>
  )
}
