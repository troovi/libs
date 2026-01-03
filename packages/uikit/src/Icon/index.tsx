import classNames from 'classnames'
import { forwardRef } from 'react'

export type IconPathData = string | string[]
export type IconDefinition = [number, number, (string | number)[], string, IconPathData]

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconDefinition
  size?: 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, size = 'm', ...restProps }, ref) => {
    const [width, height, , , svgPathData] = icon

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className={classNames(`icon icon-size-${size}`, className)}
        {...restProps}
        role="img"
      >
        <Paths paths={svgPathData} />
      </svg>
    )
  }
)

const Paths = ({ paths }: { paths: string[] | string }) => {
  if (Array.isArray(paths)) {
    return (
      <g>
        {paths.map((d, i) => (
          <path key={`-d-${i}`} fill="currentColor" d={d} />
        ))}
      </g>
    )
  }

  return <path fill="currentColor" d={paths} />
}
