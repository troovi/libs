interface Style {
  [key: string]: string
}

const cache = new WeakMap<Element, Style>()

export function set(el: Element | HTMLElement | null | undefined, styles: Style, ignoreCache = false) {
  if (!el || !(el instanceof HTMLElement)) return
  const originalStyles: Style = {}

  Object.entries(styles).forEach(([key, value]) => {
    if (key.startsWith('--')) {
      el.style.setProperty(key, value)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalStyles[key] = (el.style as any)[key]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(el.style as any)[key] = value
  })

  if (ignoreCache) return

  cache.set(el, originalStyles)
}

export function reset(el: Element | HTMLElement | null, prop?: string) {
  if (!el || !(el instanceof HTMLElement)) return
  const originalStyles = cache.get(el)

  if (!originalStyles) {
    return
  }

  if (prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(el.style as any)[prop] = originalStyles[prop]
  } else {
    Object.entries(originalStyles).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(el.style as any)[key] = value
    })
  }
}

export function getTranslate(element: HTMLElement): number | null {
  if (!element) {
    return null
  }
  const style = window.getComputedStyle(element)
  const transform =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    style.transform || style.webkitTransform || style.mozTransform
  let mat = transform.match(/^matrix3d\((.+)\)$/)
  if (mat) {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
    // vertical translateY lives at index 13
    return parseFloat(mat[1].split(', ')[13])
  }
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
  mat = transform.match(/^matrix\((.+)\)$/)
  return mat ? parseFloat(mat[1].split(', ')[5]) : null
}

export function dampenValue(v: number) {
  return 8 * (Math.log(v + 1) - 2)
}

const nonTextInputTypes = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'image',
  'button',
  'submit',
  'reset'
])

export function isInput(target: Element) {
  return (
    (target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type)) ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

function testPlatform(re: RegExp): boolean | undefined {
  return typeof window !== 'undefined' && window.navigator != null ? re.test(window.navigator.platform) : undefined
}

function isMac(): boolean | undefined {
  return testPlatform(/^Mac/)
}

function isIPhone(): boolean | undefined {
  return testPlatform(/^iPhone/)
}

function isIPad(): boolean | undefined {
  return (
    testPlatform(/^iPad/) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1)
  )
}

export function isIOS(): boolean | undefined {
  return isIPhone() || isIPad()
}

export function isMobileFirefox(): boolean | undefined {
  const userAgent = navigator.userAgent
  return (
    typeof window !== 'undefined' &&
    ((/Firefox/.test(userAgent) && /Mobile/.test(userAgent)) || /FxiOS/.test(userAgent))
  )
}

type PossibleRef<T> = React.Ref<T> | undefined

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref !== null && ref !== undefined) {
    ;(ref as React.MutableRefObject<T>).current = value
  }
}

export function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T) => refs.forEach((ref) => setRef(ref, node))
}
