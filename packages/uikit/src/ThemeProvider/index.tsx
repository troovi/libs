import { createContext, useContext, useEffect, useState } from 'react'
import { getColorScheme, updateDOM } from './helpers'
import type { ColorSchemeExtendedType, ColorSchemeType } from './types'

export interface UseColorSchemeProps {
  setColorScheme: (scheme: ColorSchemeExtendedType) => void
  colorScheme?: ColorSchemeExtendedType
  resolvedColorScheme?: ColorSchemeType
}

const ColorSchemeContext = createContext<UseColorSchemeProps>({
  setColorScheme: () => {}
})

export const useTheme = () => {
  return useContext(ColorSchemeContext)
}

export interface ThemeProviderProps extends React.PropsWithChildren {
  storageKey?: string
  defaultColorScheme?: ColorSchemeExtendedType
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const { defaultColorScheme = 'system', storageKey = 'theme', children } = props
  const [colorScheme, setColorScheme] = useState<ColorSchemeExtendedType>(() => {
    return getColorScheme(storageKey, defaultColorScheme)
  })

  const handleColorScheme = (newColorScheme: ColorSchemeExtendedType) => {
    setColorScheme(newColorScheme)
    localStorage.setItem(storageKey, newColorScheme)
  }

  // handle system theme changing
  useEffect(() => {
    const mediaQuery = window ? window.matchMedia('(prefers-color-scheme: dark)') : undefined

    if (!mediaQuery) {
      return
    }

    const handleMediaQuery = () => {
      if (colorScheme === 'system') {
        updateDOM('system')
      }
    }

    mediaQuery.addEventListener?.('change', handleMediaQuery)
    handleMediaQuery()

    return () => {
      mediaQuery.removeEventListener?.('change', handleMediaQuery)
    }
  }, [colorScheme])

  // apply changes to other opened tabs
  useEffect(() => {
    if (!window) {
      return
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }

      if (!e.newValue) {
        handleColorScheme(defaultColorScheme)
      } else {
        setColorScheme(e.newValue as ColorSchemeExtendedType)
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [handleColorScheme, defaultColorScheme])

  // apply a color scheme
  useEffect(() => {
    updateDOM(colorScheme)
  }, [colorScheme])

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme: handleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}
