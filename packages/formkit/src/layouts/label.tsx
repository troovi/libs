import { createLayout } from '@troovi/chezit'

interface Params {
  title: React.ReactNode
  label?: React.ReactNode
}

export const Label = createLayout(({ title, label }: Params) => {
  return ({ children }) => {
    return (
      <div className="form-group">
        <label className="form-label">{title}</label>
        <div className="form-content">{children}</div>
        {label && <div className="form-helper">{label}</div>}
      </div>
    )
  }
})
