import './test.scss'

// import { Popover } from '../Popover'
// import { Calendar } from '../DatePicker/Calendar'
import { useLayoutEffect } from 'react'
import { DatePickerControl } from './date-picker'

const PopoverDemo = () => {
  return (
    <div style={{ width: '280px' }}>
      <DatePickerControl size="md" />
    </div>
  )
  // const [value, setValue] = useState(new Date())

  // return (
  //   <Popover
  //     open
  //     fitMaxHeight={false}
  //     content={() => <Calendar value={value} onChange={setValue} disableFuture />}
  //   >
  //     <div></div>
  //   </Popover>
  // )
}

// const Check = () => {
//   console.log('render')
//   return <div>Check</div>
// }

export const TestApp = () => {
  useLayoutEffect(() => {
    document.body.classList.add('theme-light')
  }, [])

  return (
    <div className="examples-list" style={{ alignItems: 'center' }}>
      <div />
      <PopoverDemo />
      <div />
    </div>
  )
}
