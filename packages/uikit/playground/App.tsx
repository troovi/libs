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
      <ButtonsExample />
      <SelectExample />
      <div className="flex flex-col">
        <DrawerApp />
      </div>
      <PopupExample />
      <TextInput />
      <NumberInputs />
    </div>
  )
}

const DrawerApp = () => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Drawer
        onClosed={() => console.log('CLOSED')}
        onClose={() => setOpen(false)}
        isOpen={isOpen}
        size="60%"
      >
        <div onClick={() => setOpen(false)}>App: click to close</div>
      </Drawer>
      <Button onClick={() => setOpen((value) => !value)}>{isOpen ? 'Close' : 'Open'} drawer</Button>
    </>
  )
}
