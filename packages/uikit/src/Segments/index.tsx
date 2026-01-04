import { SliderOptions, makeTabId, useTabSlider } from '../__hooks/use-tab-slider'
import { attr } from '@companix/utils-browser'
import { useId, useRef } from 'react'

interface SegmentOption<T> {
  label: React.ReactNode
  value: T
}

export interface SegmentsProps<T> {
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
}

export const Segments = <T extends number | string>({ value, onChange, options }: SegmentsProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const currentIndex = options.findIndex((option) => option.value === value)
  const baseId = useId().replaceAll(':', '')

  return (
    <div className="segments-container">
      <div role="radiogroup" className="segments" ref={containerRef}>
        {currentIndex > -1 && (
          <SegmentsSlider containerRef={containerRef} baseId={baseId} value={value} />
        )}
        {options.map((option) => {
          return (
            <div
              key={`segment-${option.value}`}
              id={makeTabId(baseId, option.value)}
              onClick={() => onChange(option.value)}
              className="segments-option"
              data-selected={attr(option.value === value)}
            >
              {option.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SegmentsSlider = (options: SliderOptions) => {
  const styles = useTabSlider(options)

  return <div aria-hidden className="segments-slider" style={styles} />
}
