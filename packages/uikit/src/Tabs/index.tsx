import { makeTabId, useTabSlider } from '../__hooks/use-tab-slider'
import * as RadixTabs from '@radix-ui/react-tabs'
import { createContext, useContext, useId, useRef } from 'react'

export interface TabsProps<T extends string> {
  children: React.ReactNode
  onChange: (value: T) => void
  value: T
}

const TabsContext = createContext({ baseId: '', containerRef: {} as React.RefObject<HTMLDivElement> })

export const Tabs = <T extends string>({ children, value, onChange }: TabsProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const baseId = useId().replaceAll(':', '')

  return (
    <RadixTabs.Root value={value} onValueChange={(value) => onChange(value as T)}>
      <TabsContext.Provider value={{ baseId, containerRef }}>
        <RadixTabs.List className="tabs" ref={containerRef}>
          <TabIndicator value={value} />
          {children}
        </RadixTabs.List>
      </TabsContext.Provider>
    </RadixTabs.Root>
  )
}

const TabIndicator = ({ value }: { value: string }) => {
  const { baseId, containerRef } = useContext(TabsContext)

  const styles = useTabSlider({ baseId, value, containerRef })

  return (
    <div className="tab-indicator-container" style={styles}>
      <div className="tab-indicator" />
    </div>
  )
}

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const Tab = ({ children, value, ...restProps }: TabProps) => {
  const { baseId } = useContext(TabsContext)

  return (
    <RadixTabs.Trigger {...restProps} id={makeTabId(baseId, value)} className="tab" value={value}>
      {children}
    </RadixTabs.Trigger>
  )
}

Tabs.Tab = Tab
