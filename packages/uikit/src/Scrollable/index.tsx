import classNames from 'classnames'
import { forwardRef } from 'react'
import { px, varToStyle } from '@companix/utils-browser'

interface OuterImplementation {
  implementation: 'outer'
  shadowPadding?: number
  scrollbarWidth: number
  noneCorrect?: boolean
}

interface EdgeImplementation {
  implementation: 'edge'
  scrollbarWidth: number
  padding: number
}

interface InnerImplementation {
  implementation: 'inner'
  padding: number
}

interface ScrollableProps {
  heightAuto?: boolean
  scrollX?: boolean
  scrollY?: boolean
  interactionKind?: 'static' | 'hover'
  thumbPos?: 'center' | 'border'
  thumbPadding?: number
  thumbColor?: string
  onWheel?: React.WheelEventHandler<HTMLDivElement>
  onScroll?: React.UIEventHandler<HTMLDivElement>
  maxHeight?: number
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

type Implementation = InnerImplementation | OuterImplementation | EdgeImplementation

const Scrollable = forwardRef<HTMLDivElement, ScrollableProps & Implementation>((props, ref) => {
  let {
    interactionKind = 'static',
    thumbPos = 'center',
    thumbPadding = 4,
    heightAuto,
    scrollX,
    className,
    scrollY,
    onWheel,
    maxHeight,
    onScroll,
    thumbColor,
    children
  } = props

  const style: React.CSSProperties = (() => {
    if (props.implementation === 'edge') {
      thumbPadding = 0

      const { padding, scrollbarWidth } = props

      return {
        ...varToStyle({ '--scrollbar-width': px(scrollbarWidth) }),
        padding: `0px ${padding - scrollbarWidth}px 0px ${padding}px`
      }
    }

    if (props.implementation === 'outer') {
      const { shadowPadding = 0, noneCorrect, scrollbarWidth } = props

      if ((window as any).IS_MOBILE) {
        return {
          padding: shadowPadding,
          margin: -shadowPadding
        }
      }

      return {
        ...varToStyle({ '--scrollbar-width': px(scrollbarWidth) }),
        padding: shadowPadding,
        margin: -shadowPadding,
        marginRight: noneCorrect ? undefined : `calc(-${scrollbarWidth}px - ${shadowPadding}px)`,
        marginBottom: 0
      }
    }

    if (props.implementation === 'inner') {
      const { padding } = props

      if ((window as any).IS_MOBILE) {
        return {
          [scrollY ? 'paddingLeft' : 'paddingTop']: padding,
          [scrollY ? 'paddingRight' : 'paddingBottom']: padding
        }
      }

      return {
        [scrollY ? 'paddingLeft' : 'paddingTop']: padding,
        ...varToStyle({ '--scrollbar-width': px(padding) })
      }
    }

    return {}
  })()

  return (
    <div
      ref={ref}
      onWheel={onWheel}
      onScroll={onScroll}
      onMouseDown={(e) => {
        e.preventDefault()
      }}
      style={{
        ...style,
        ...props.style,
        ...{ maxHeight: maxHeight ? px(maxHeight) : undefined },
        ...varToStyle({ '--thumb-padding': px(thumbPadding) }),
        ...varToStyle({ '--thumb-color': thumbColor ?? '#c1c2c8bd' })
      }}
      className={classNames(
        !(window as any).IS_MOBILE && 'scrollable',
        className,
        heightAuto ? '' : 'h-full',
        {
          'overflow-y-scroll': scrollY,
          'overflow-x-scroll': scrollX,
          'scrollable-hover-interaction': interactionKind === 'hover',
          'scrollable-border-position': thumbPos === 'border'
        }
      )}
    >
      {children}
    </div>
  )
})

export { Scrollable }
