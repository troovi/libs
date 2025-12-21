export const pc = (n: number) => `${n}%`

export const px = (n: number) => `${n}px`

export const width = (w: number) => {
  return {
    width: w,
    minWidth: w,
    maxWidth: w
  }
}

export const height = (h: number) => {
  return {
    height: h,
    minHeight: h,
    maxHeight: h
  }
}

export const box = (h: number = 48, w?: number) => {
  if (!w) w = h
  return {
    width: w,
    minWidth: w,
    minHeight: h,
    height: h
  }
}

export const backImg = (src: string) => {
  return {
    style: {
      backgroundImage: `url("${src}")`
    }
  }
}

export const setCssVariable = (property: string, value: string) => {
  document.documentElement.style.setProperty(property, value)
}

export const varToStyle = (props: Record<string, string | number>) => {
  return props as React.CSSProperties
}

export const capitalize = (str: string) => {
  return str[0].toUpperCase() + str.slice(1)
}
