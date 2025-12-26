export const getContainers = (element: Element, callback: (element: Element) => void) => {
  callback(element)

  if (element.children) {
    for (const child of Array.from(element.children)) {
      if (child.tagName === 'DIV') {
        getContainers(child, callback)
      }
    }
  }
}

export const canUseDOM = (() => {
  return typeof window !== 'undefined' && !!window.document && !!window.document.createElement
})()

export const canUseEventListeners: boolean = canUseDOM && !!window.addEventListener

export const onDOMLoaded = (callback: (...args: any[]) => any) => {
  if (document.readyState !== 'loading') {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', callback)
  }
}

export const callMultiple =
  (...fns: any[]) =>
  (...args: any[]): void =>
    fns.filter((f) => typeof f === 'function').forEach((f) => f(...args))

export const getActiveElementByAnotherElement = (el: Element | null): Element | null =>
  el ? el.ownerDocument.activeElement : null

export const contains = (parent?: Element | null, child?: Element | null): boolean => {
  return parent && child ? parent.contains(child) : false
}

export const isHTMLElement = (value: any): value is HTMLElement => {
  return value.nodeType === Node.ELEMENT_NODE
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max))
