import type { ColorSchemeExtendedType } from './types'

export const getColorScheme = (key: string, defaultColorScheme: ColorSchemeExtendedType) => {
  let colorScheme

  try {
    colorScheme = (localStorage.getItem(key) as ColorSchemeExtendedType) || undefined
  } catch (e) {
    // Unsupported
  }

  return colorScheme ?? defaultColorScheme
}

export const getSystemColorScheme = (e?: MediaQueryList | MediaQueryListEvent) => {
  if (!e) {
    e = window.matchMedia('(prefers-color-scheme: dark)')
  }

  return e.matches ? 'dark' : 'light'
}

export const updateDOM = (colorScheme: ColorSchemeExtendedType) => {
  const [LIGHT_CLASS_NAME, DARK_CLASS_NAME] = ['theme-light', 'theme-dark']

  let resolved = colorScheme

  if (colorScheme === 'system') {
    resolved = getSystemColorScheme()
  }

  document.documentElement.classList.remove(LIGHT_CLASS_NAME, DARK_CLASS_NAME)
  document.documentElement.classList.add(resolved === 'dark' ? DARK_CLASS_NAME : LIGHT_CLASS_NAME)
  document.documentElement.style.colorScheme = resolved
}
