export enum Modifier {
  Mod = 'Mod',
  Alt = 'Alt',
  Shift = 'Shift',
  Meta = 'Meta'
}

export interface KeyCombo {
  key: string
  code: string
}

const MODULE_KEY_COMBOS = [
  Modifier.Shift,
  Modifier.Mod,
  'ArrowDown',
  'ArrowUp',
  `${Modifier.Mod}+ArrowDown`,
  `${Modifier.Mod}+ArrowUp`,
  'Enter',
  'Escape',
  'Backspace',
  `${Modifier.Shift}+Enter`,
  `${Modifier.Mod}+Enter`,
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  `${Modifier.Shift}+Tab`,
  'Space',
  `${Modifier.Mod}+B`,
  `${Modifier.Mod}+U`,
  `${Modifier.Mod}+I`,
  `${Modifier.Mod}+S`,
  `${Modifier.Mod}+K`,
  `${Modifier.Mod}+Equal`,
  `${Modifier.Mod}+${Modifier.Shift}+Equal`,
  `${Modifier.Mod}+Minus`,
  `${Modifier.Mod}+${Modifier.Shift}+Minus`,
  'PageUp',
  'PageDown',
  'Home',
  'End'
] as const

export type ComboKeys = (typeof MODULE_KEY_COMBOS)[number]

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform)

const isMetaPressed = (event: KeyboardEvent) => {
  return event.key === 'Meta' || event.metaKey
}

const isCtrlPressed = (event: KeyboardEvent) => {
  return event.key === 'Control' || event.ctrlKey
}

const modifierCheckers: Record<Modifier, (event: KeyboardEvent) => boolean> = {
  [Modifier.Mod]: (event) => (isMac ? isMetaPressed(event) : isCtrlPressed(event)),
  [Modifier.Alt]: (event) => event.key === 'Alt' || event.altKey,
  [Modifier.Shift]: (event) => event.key === 'Shift' || event.shiftKey,
  [Modifier.Meta]: (event) => (isMac ? isCtrlPressed(event) : isMetaPressed(event))
}

export const getKeyCombo = (event: KeyboardEvent): KeyCombo | undefined => {
  try {
    const modifiers: string[] = []

    for (const modifier of Object.values(Modifier)) {
      if (modifierCheckers[modifier](event)) {
        modifiers.push(modifier)
      }
    }

    // Если нажата только модификаторная клавиша
    if (['Meta', 'Control', 'Alt', 'Shift'].includes(event.key)) {
      const combo = modifiers.join('+')
      return { key: combo, code: combo }
    }

    const codePrefix = ['Key', 'Digit', 'Numpad'].find((prefix) => event.code.startsWith(prefix))
    const normalizedCode = codePrefix ? event.code.slice(codePrefix.length) : event.code

    const normalizedKey = event.key.length === 1 ? event.key.toUpperCase() : event.key

    return {
      key: [...modifiers, normalizedKey].join('+'),
      code: [...modifiers, normalizedCode].join('+')
    }
  } catch {
    return undefined
  }
}

export const getModuleKeyCombo = (event: KeyboardEvent): string | null => {
  const combo = getKeyCombo(event)

  if (!combo) {
    return null
  }

  const { key, code } = combo

  return [key, code].find((value) => MODULE_KEY_COMBOS.includes(value as ComboKeys)) ?? null
}

const onElementKeyDownFactory = (handler: (combo: string | null, event: KeyboardEvent) => void) => {
  return (event: KeyboardEvent) => {
    handler(getModuleKeyCombo(event), event)
  }
}

export { onElementKeyDownFactory }
