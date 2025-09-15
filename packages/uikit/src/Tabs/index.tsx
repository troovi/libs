import './Tabs.scss'
import * as RadixTabs from '@radix-ui/react-tabs'

interface Props<T extends string> {
  children: React.ReactNode
  onChange: (value: T) => void
  value: T
}

const Tabs = <T extends string>({ children, value, onChange }: Props<T>) => {
  return (
    <RadixTabs.Root className="TabsRoot" value={value} onValueChange={onChange as () => void}>
      <RadixTabs.List className="TabsList">{children}</RadixTabs.List>
    </RadixTabs.Root>
  )
}

Tabs.Tab = ({ children, value }: { children: React.ReactNode; value: string }) => {
  return (
    <RadixTabs.Trigger className="TabsTrigger" value={value}>
      {children}
    </RadixTabs.Trigger>
  )
}

export { Tabs }
