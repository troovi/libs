import { createLayout } from '@troovi/chezit'

export const Container = createLayout((title: React.ReactNode) => {
  return ({ children }) => {
    return (
      <div className="form-container rounded-lg border px-12 py-14">
        <div className="mb-18 text-base font-medium">{title}</div>
        <div className="flex flex-col gap-20">{children}</div>
      </div>
    )
  }
})
