import { ProgressBar, ProgressBarProps } from '@/Progress'
import { useState } from 'react'

export const ProgressBarExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <ProgressBarControlled appearance="primary" />
        <ProgressBarControlled appearance="neutral" />
        <ProgressBarControlled appearance="negative" />
        <ProgressBarControlled appearance="positive" />
      </div>
    </div>
  )
}

const ProgressBarControlled = ({ appearance }: Omit<ProgressBarProps, 'value'>) => {
  const [value] = useState(40)

  // useEffect(() => {
  //   setInterval(() => {
  //     setValue((value) => {
  //       if (value > 140) {
  //         return 0
  //       }

  //       return value + 10 + Math.random() * 20
  //     })
  //   }, 1000)
  // }, [])

  return (
    <div className="rounded-md p-10 w-full" style={{ boxShadow: '0 0 0 1px rgba(17,20,24,.15)' }}>
      <ProgressBar value={value / 100} appearance={appearance} />
    </div>
  )
}
