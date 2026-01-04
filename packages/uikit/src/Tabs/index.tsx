import { makeTabId, useTabSlider } from '../__hooks/use-tab-slider'
import * as RadixTabs from '@radix-ui/react-tabs'
import { createContext, useContext, useId, useRef } from 'react'

export interface TabsProps {
  children: React.ReactNode
  onChange: (value: string) => void
  value: string
}

const TabsContext = createContext({ baseId: '', containerRef: {} as React.RefObject<HTMLDivElement> })

export const Tabs = ({ children, value, onChange }: TabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const baseId = useId().replaceAll(':', '')

  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
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
