import { createLayout } from '@troovi/chezit'

export const Double = createLayout(() => {
  return ({ children }) => {
    return <div className="double--input">{children}</div>
  }
})
