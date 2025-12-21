interface ExampleProps {
  children: React.ReactNode
  pane?: React.ReactNode
  name: string
}

export const Example = ({ name, children, pane }: ExampleProps) => {
  return (
    <div className="sample">
      <div className="sample-name">{name}</div>
      <div>{children}</div>
    </div>
  )
}
