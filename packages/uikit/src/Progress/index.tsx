import { clamp, pc } from '@companix/utils-browser'

export interface ProgressBarProps {
  appearance?: 'primary' | 'neutral' | 'positive' | 'negative'
  value: number
}

export const ProgressBar = ({ appearance = 'primary', value }: ProgressBarProps) => {
  const percent = 100 * clamp(value, 0, 1)

  return (
    <div aria-valuemax={100} aria-valuemin={0} role="progressbar" className="progress-bar">
      <div className="progress-bar-thumb" data-appearance={appearance} style={{ width: pc(percent) }} />
    </div>
  )
}
