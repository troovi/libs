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
import { NumberInputs } from './number-inputs'
import { ProgressBarExample } from './progress'
import { FileExample } from './file'
import { DialogRegistries } from './__registries/popups'
import { PopoverRegistries } from './__registries/popovers'
import { ThemeProvider } from '@/ThemeProvider'
import { ThemeSwitcher } from './ThemeSwitcher'
import { SCSSReady } from './PaintReady'

export const App = () => {
  return (
    <ThemeProvider>
      <SCSSReady>
        <AppLayout />
      </SCSSReady>
    </ThemeProvider>
  )
}

const AppLayout = () => {
  console.log('AppLayout render')

  return (
    <div className="flex flex-col">
      <div className="header sticky flex items-center justify-between bg-white top-0 z-40">
        <div className="font-semibold text-black">@companix/uikit</div>
        <ThemeSwitcher />
      </div>
      <div className="examples-list">
        <div />
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
        <Example name="NumberInputs">
          <NumberInputs />
        </Example>
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
        <Example name="File">
          <FileExample />
        </Example>
        <Example name="ProgressBar">
          <ProgressBarExample />
        </Example>
        <Example name="Toaster">
          <ToasterExample />
        </Example>
        <div style={{ height: '2px', background: 'rgb(0 0 0 / 6%)' }} />
        <Example name="Dialog Registry">
          <DialogRegistries />
        </Example>
        <Example name="Popover Registry">
          <PopoverRegistries />
        </Example>
        <div />
        <div />
      </div>
    </div>
  )
}
