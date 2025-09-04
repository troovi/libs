import { createLayout } from '@troovi/chezit'

export const Label = createLayout((label: React.ReactNode) => {
  return ({ children }) => {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="form-content">{children}</div>
      </div>
    )
  }
})
