import { CSSCustomProperties, attr } from '@companix/utils-browser'

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
  const currentIndex = options.findIndex((option) => option.value === value)

  const sliderStyle: CSSCustomProperties = {
    '--uikit--current-index': String(currentIndex),
    '--uikit--options': String(options.length)
  }

  return (
    <div className="segments-container">
      <div role="radiogroup" className="segments">
        {currentIndex > -1 && <div aria-hidden className="segments-slider" style={sliderStyle} />}
        {options.map((option) => {
          return (
            <div
              key={`segment-${option.value}`}
              onClick={() => onChange(option.value)}
              className="segments-option"
              data-active={attr(option.value === value)}
            >
              {option.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
