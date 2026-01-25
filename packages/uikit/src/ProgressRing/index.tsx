import { getInitialsFontSize } from '../Avatar/helpers'
import { clamp, customCSS, px } from '@companix/utils-browser'

export interface ProgressRingProps {
  appearance?: 'primary' | 'neutral' | 'positive' | 'negative'
  value: number
  size?: number
  width?: number
  hint?: boolean
}

const ProgressRing = ({
  appearance = 'primary',
  hint,
  size = 80,
  width = 6,
  value
}: ProgressRingProps) => {
  const percentage = 100 * clamp(value, 0, 1)

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percentage}
      role="progressbar"
      className="progress-ring"
      data-appearance={appearance}
    >
      <svg
        className="progress-ring-image"
        style={customCSS({
          '--percentage': percentage / 100,
          '--size': px(size),
          '--track-width': px(width)
        })}
      >
        <circle className="progress-ring-track" />
        <circle className="progress-ring-indicator" />
      </svg>
      {hint && (
        <div
          className="progress-ring-hint"
          style={{ fontSize: clamp(getInitialsFontSize(size) - 4, 0, 18) }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

export { ProgressRing }
