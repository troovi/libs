export const pc = (n: number) => `${n}%`

export const px = (n: number) => `${n}px`

export const width = (w: number) => {
  return { width: w, minWidth: w, maxWidth: w }
}

export const height = (h: number) => {
  return { height: h, minHeight: h, maxHeight: h }
}

export const box = (h: number = 48, w?: number) => {
  if (!w) w = h
  return { width: w, minWidth: w, minHeight: h, height: h }
}

export const backgroundImage = (source: string): React.CSSProperties => {
  return { backgroundImage: `url("${source}")` }
}

export const setCssVariable = (property: string, value: string) => {
  document.documentElement.style.setProperty(property, value)
}

export const customCSS = (properties: CSSCustomProperties) => properties

export const attr = (bool?: boolean | null) => {
  return bool ? '' : undefined
}

export type CSSCustomProperties<T extends string | number | undefined = string> = Record<
  `--${string}`,
  T
>
