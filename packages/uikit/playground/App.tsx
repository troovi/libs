import { Test1Animation } from './animation-test-1'
import { Test2Animation, Test2CompletedAnimation } from './animation-test-2'
import { ButtonsExample } from './buttons'
import { SelectExample } from './select'
import { PopupExample } from './popup'
import { TextInput } from './text-input'
import { NumberInputs } from './number-inputs'
import { Button } from '@/Button'
import { useState } from 'react'
import { Drawer } from '@/Drawer'
import { Popup } from '@/Popup'
import { PopoversExample } from './popovers'
import { Tabs } from '@/Tabs'

export const App = () => {
  return (
    <div className="examples-list">
      <div style={{ height: '200px', width: '100%', position: 'relative' }}>
        <div className="row-group" style={{ position: 'absolute' }}>
          <Test1Animation />
          <Test2Animation />
          <Test2CompletedAnimation />
        </div>
      </div>
      <TabsApp />
      <ButtonsExample />
      <SelectExample />
      <PopoversExample />
      <div className="flex flex-col gap-10">
        <DrawerApp />
        <PopupApp />
      </div>
      <PopupExample />
      <TextInput />
      <NumberInputs />
    </div>
  )
}

const TabsApp = () => {
  const [tab, setTab] = useState('tab-1')

  return (
    <div>
      <Tabs onChange={setTab} value={tab}>
        <Tabs.Tab value="tab-1">Tab1</Tabs.Tab>
        <Tabs.Tab value="tab-2">Tab2</Tabs.Tab>
      </Tabs>
      Active: {tab}
    </div>
  )
}

const DrawerApp = () => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Drawer onClose={() => setOpen(false)} isOpen={isOpen} size="60%">
        <Content close={() => setOpen(false)} />
      </Drawer>
      <Button onClick={() => setOpen((value) => !value)}>{isOpen ? 'Close' : 'Open'} drawer</Button>
    </>
  )
}

const Content = ({ close }: { close: () => void }) => {
  console.log('RENDER')
  return <div onClick={close}>App: click to close</div>
}

const PopupApp = () => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Popup onClose={() => setOpen(false)} isOpen={isOpen} className="popup-1">
        <div style={{ padding: '10px' }}>
          <Button onClick={() => setOpen(false)}>App: click to close</Button>
        </div>
      </Popup>
      <Button onClick={() => setOpen((value) => !value)}>{isOpen ? 'Close' : 'Open'} popup</Button>
    </>
  )
}
