// import { Test1Animation } from './animation-test-1'
// import { Test2Animation, Test2CompletedAnimation } from './animation-test-2'
// import { SelectExample } from './select'
// import { PopupExample } from './popup'
// import { TextInput } from './text-input'
// import { NumberInputs } from './number-inputs'
// import { Button } from '../Button'
// import { useState } from 'react'
// import { Drawer } from '../Drawer'
// import { Popup } from '../Popup'
// import { TestApp } from './Test'
import { useLayoutEffect } from 'react'
import { ButtonsExample, ButtonsGroupExample } from './buttons'
import { PopoversExample } from './popovers'
import { Example } from './Example'
import { SelectExample } from './select'
import { TooltipExample } from './tooltip'
import { CheckboxExample } from './checkbox'
import { RadioGroupExample } from './radio-group'
import { TabsExample } from './tabs'
import { ToasterExample } from './toaster'
import { DialogExample } from './dialog'
import { InputsExample } from './input'
import { TextAreaExample } from './text-area'
import { SelectTagsExample } from './select-tags'
import { DateInputExample } from './date-input'
import { DatePickerExample } from './date-picker'
import { SwitchExample } from './switch'
import { DialogAlertExample } from './dialog-alert'
import { DrawerExample } from './drawer'
import { FormGroupExample } from './form-group'
import { TimePickerExample } from './time-picker'
// import { InlineInputsExample } from './inline-input'
// import { Tabs } from '../Tabs'

export const App = () => {
  useLayoutEffect(() => {
    document.body.classList.add('theme-light')
  }, [])

  // return <TestApp />
  return (
    <div className="examples-list">
      <div />
      <div />
      {/* <div style={{ height: '200px', width: '100%', position: 'relative' }}>
        <div className="row-group" style={{ position: 'absolute' }}>
          <Test1Animation />
          <Test2Animation />
          <Test2CompletedAnimation />
        </div>
      </div>
      <TabsApp />
      <ButtonsExample />
      <SelectExample /> */}
      <Example name="Popovers">
        <PopoversExample />
      </Example>
      <Example name="Tooltip">
        <TooltipExample />
      </Example>
      <Example name="Dialog">
        <DialogExample />
      </Example>
      <Example name="DialogAlert">
        <DialogAlertExample />
      </Example>
      <Example name="Drawer">
        <DrawerExample />
      </Example>
      <Example name="Input">
        <InputsExample />
      </Example>
      {/* <Example name="InlineInput">
        <InlineInputsExample />
      </Example> */}
      <Example name="TextArea">
        <TextAreaExample />
      </Example>
      <Example name="Select">
        <SelectExample />
      </Example>
      <Example name="SelectTags">
        <SelectTagsExample />
      </Example>
      <Example name="DateInput">
        <DateInputExample />
      </Example>
      <Example name="DatePicker">
        <DatePickerExample />
      </Example>
      <Example name="TimePicker">
        <TimePickerExample />
      </Example>
      <Example name="FormGroup">
        <FormGroupExample />
      </Example>
      <Example name="Checkbox">
        <CheckboxExample />
      </Example>
      <Example name="RadioGroup">
        <RadioGroupExample />
      </Example>
      <Example name="Switch">
        <SwitchExample />
      </Example>
      <Example name="Tabs">
        <TabsExample />
      </Example>
      <Example name="Buttons">
        <ButtonsExample />
      </Example>
      <Example name="ButtonGroup">
        <ButtonsGroupExample />
      </Example>
      <Example name="Toaster">
        <ToasterExample />
      </Example>

      {/* <div className="flex flex-col gap-10">
        <DrawerApp />
        <PopupApp />
      </div>
      <PopupExample />
      <TextInput />
      <NumberInputs /> */}
      <div />
      <div />
    </div>
  )
}

// const TabsApp = () => {
//   const [tab, setTab] = useState('tab-1')

//   return (
//     <div>
//       <Tabs onChange={setTab} value={tab}>
//         <Tabs.Tab value="tab-1">Tab1</Tabs.Tab>
//         <Tabs.Tab value="tab-2">Tab2</Tabs.Tab>
//       </Tabs>
//       Active: {tab}
//     </div>
//   )
// }

// const DrawerApp = () => {
//   const [isOpen, setOpen] = useState(false)

//   return (
//     <>
//       <Drawer onClose={() => setOpen(false)} isOpen={isOpen} size="60%">
//         <Content close={() => setOpen(false)} />
//       </Drawer>
//       <Button onClick={() => setOpen((value) => !value)}>{isOpen ? 'Close' : 'Open'} drawer</Button>
//     </>
//   )
// }

// const Content = ({ close }: { close: () => void }) => {
//   console.log('RENDER')
//   return <div onClick={close}>App: click to close</div>
// }

// const PopupApp = () => {
//   const [isOpen, setOpen] = useState(false)

//   return (
//     <>
//       <Popup onClose={() => setOpen(false)} isOpen={isOpen} className="popup-1">
//         <div style={{ padding: '10px' }}>
//           <Button onClick={() => setOpen(false)}>App: click to close</Button>
//         </div>
//       </Popup>
//       <Button onClick={() => setOpen((value) => !value)}>{isOpen ? 'Close' : 'Open'} popup</Button>
//     </>
//   )
// }
