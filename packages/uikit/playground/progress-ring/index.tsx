import { ProgressRing, ProgressRingProps } from '@/ProgressRing'
import { avatarSizes } from '@/index'
import { useEffect, useState } from 'react'

export const ProgressCircleExample = () => {
  return (
    <div className="col-group">
      <div className="row-group" style={{ gap: '40px' }}>
        <div className="row-group">
          <ProgressCircleControlled appearance="primary" />
          <ProgressCircleControlled appearance="neutral" />
          <ProgressCircleControlled appearance="negative" />
          <ProgressCircleControlled appearance="positive" />
        </div>
        <div className="row-group">
          <ProgressCircleControlled appearance="primary" hint />
          <ProgressCircleControlled appearance="neutral" hint />
          <ProgressCircleControlled appearance="negative" hint />
          <ProgressCircleControlled appearance="positive" hint />
        </div>
      </div>
      <div className="sample-splitter" />
      <div className="flex flex-wrap items-center gap-8">
        {[...avatarSizes].reverse().map((size) => (
          <ProgressCircleControlled key={size} size={size} hint />
        ))}
      </div>
    </div>
  )
}

const ProgressCircleControlled = (props: Omit<ProgressRingProps, 'value'>) => {
  const [value, setValue] = useState(40)

  useEffect(() => {
    if (2 > 3) {
      setInterval(() => {
        setValue((value) => {
          if (value > 140) {
            return 0
          }

          return value + 10 + Math.random() * 20
        })
      }, 1000)
    }
  }, [])

  return <ProgressRing value={value / 100} {...props} />
}
