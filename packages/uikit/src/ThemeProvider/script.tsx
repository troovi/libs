import { memo } from 'react'
import type { ColorSchemeExtendedType } from './types'

interface ColorSchemeScriptProps {
  storageKey: string
  defaultColorScheme: ColorSchemeExtendedType
}

// A script for initial scheme
export const ColorSchemeScript = memo(({ storageKey, defaultColorScheme }: ColorSchemeScriptProps) => {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(${colorSchemeScript.toString()})("${storageKey}", "${defaultColorScheme}")`
      }}
    />
  )
})

export const colorSchemeScript = (storageKey: string, defaultColorScheme: 'light' | 'dark') => {
  const [LIGHT_CLASS_NAME, DARK_CLASS_NAME] = ['theme-light', 'theme-dark']

  try {
    let colorScheme = localStorage.getItem(storageKey) || defaultColorScheme
    let resolved = colorScheme

    if (resolved === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const colorSchemeClassName = resolved === 'dark' ? DARK_CLASS_NAME : LIGHT_CLASS_NAME

    document.documentElement.classList.remove(LIGHT_CLASS_NAME, DARK_CLASS_NAME)
    document.documentElement.classList.add(colorSchemeClassName)
    document.documentElement.style.colorScheme = resolved
  } catch (e) {}
}
