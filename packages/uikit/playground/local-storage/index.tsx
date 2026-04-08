import { Input, useLocalStorage } from '@/index'

export const LocalStorageExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <Example token="base-input" />
        <Example token="base-input" />
      </div>
      <PrintValue token="base-input" />
    </div>
  )
}

const Example = ({ token }: { token: string }) => {
  const [value, setValue] = useLocalStorage<string>(token, '')

  return (
    <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Local Storage Value" />
  )
}

const PrintValue = ({ token }: { token: string }) => {
  const [value] = useLocalStorage<string>(token, '')

  return (
    <code>
      {token}: {value}
    </code>
  )
}
