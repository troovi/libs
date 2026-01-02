import classNames from 'classnames'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { forwardRef } from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconDefinition
  size?: 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, size = 'm', ...restProps }, ref) => {
    const [width, height, , , svgPathData] = icon.icon

    return (
      <svg
        ref={ref}
        data-prefix={icon.prefix}
        data-icon={icon.iconName}
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
