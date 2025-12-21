import * as RadixTabs from '@radix-ui/react-tabs'
import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  onChange: (value: string) => void
  value: string
}

const TabsContext = createContext({ baseId: '', listRef: {} as React.RefObject<HTMLDivElement> })

const makeTriggerId = (baseId: string, value: string) => {
  return `radix-${baseId}-trigger-${value}`
}

export const Tabs = ({ children, value, onChange }: Props) => {
  const listRef = useRef<HTMLDivElement>(null)
  const baseId = useId()

  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
      <TabsContext.Provider value={{ baseId, listRef }}>
        <RadixTabs.List className="tabs" ref={listRef}>
          <TabIndicator value={value} />
          {children}
        </RadixTabs.List>
      </TabsContext.Provider>
    </RadixTabs.Root>
  )
}

const TabIndicator = ({ value }: { value: string }) => {
  const [styles, setStyles] = useState<React.CSSProperties>({})
  const { baseId, listRef } = useContext(TabsContext)

  useEffect(() => {
    const state = { observer: null as null | ResizeObserver }

    if (listRef.current) {
      const tabIdSelector = `.tab[id="${makeTriggerId(baseId, value)}"]`
      const selectedTabElement = listRef.current.querySelector<HTMLElement>(tabIdSelector)

      if (selectedTabElement != null) {
        state.observer = new ResizeObserver(() => {
          const { clientHeight, clientWidth, offsetLeft, offsetTop } = selectedTabElement

          setStyles({
            height: clientHeight,
            transform: `translateX(${Math.floor(offsetLeft)}px) translateY(${Math.floor(offsetTop)}px)`,
            width: clientWidth
          })
        })

        state.observer.observe(selectedTabElement)
      } else {
        setStyles({ display: 'none' })
      }
    }

    return () => {
      if (state.observer) {
        state.observer.disconnect()
      }
    }
  }, [value])

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
  const id = makeTriggerId(baseId, value)

  return (
    <RadixTabs.Trigger {...restProps} id={id} className="tab" value={value}>
      {children}
    </RadixTabs.Trigger>
  )
}

Tabs.Tab = Tab
