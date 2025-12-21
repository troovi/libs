import { Tabs } from '@/Tabs'
import { useState } from 'react'

export const TabsExample = () => {
  const [value, onChange] = useState<string>('account')

  return (
    <div>
      <Tabs value={value} onChange={onChange}>
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="password">Password</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs>
    </div>
  )
}
