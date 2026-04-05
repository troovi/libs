export const isTextNode = (node: Node): node is Text => {
  return node.nodeType === Node.TEXT_NODE
}

export const isElementNode = (node: Node): node is Element => {
  return node.nodeType === Node.ELEMENT_NODE
}

export const getNodeTextContent = (node: Node): string => {
  // Обычный текстовый узел
  if (isTextNode(node)) {
    return node.nodeValue || ''
  }

  // Emoji-изображение считается как его alt-текст
  if (isElementNode(node) && node.nodeName === 'IMG') {
    return node.getAttribute('alt') || ''
  }

  // Блочный div внутри editor считается переводом строки
  if (isElementNode(node) && node.nodeName === 'DIV') {
    return '\n'
  }

  // <br> тоже считается переводом строки,
  // кроме специального случая внутри не-editable DIV
  if (
    isElementNode(node) &&
    node.nodeName === 'BR' &&
    !(
      node.parentElement &&
      isElementNode(node.parentElement) &&
      node.parentElement.nodeName === 'DIV' &&
      node.parentElement.getAttribute('contenteditable') !== 'true'
    )
  ) {
    return '\n'
  }

  // Все остальные узлы не дают текста
  return ''
}

export const getEditorSelection = (root: HTMLElement): { range: Range; selection: Selection } | {} => {
  const selection = document.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return {}
  }

  const range = selection.getRangeAt(0)

  // Берём selection только если оно находится внутри editor
  if (range && root.contains(range.commonAncestorContainer)) {
    return { range, selection }
  }

  return {}
}

export const getPlainTextOffset = (root: HTMLElement, targetNode: Node, targetOffset: number) => {
  let resultOffset = targetOffset
  let currentTarget: Node | undefined = targetNode

  // Если range указывает прямо на корневой editor,
  // offset означает индекс дочернего узла, а не символа.
  if (root === targetNode) {
    resultOffset = 0
    currentTarget = root.childNodes[targetOffset]
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) {
    // Дошли до нужного DOM-узла:
    // всё, что уже накопили + локальный offset внутри этого узла
    if (walker.currentNode === currentTarget) {
      return resultOffset
    }

    // Иначе прибавляем "текстовую длину" текущего узла
    // (текст, emoji alt, перевод строки для <br>/<div> и т.д.)
    resultOffset += getNodeTextContent(walker.currentNode).length
  }

  return resultOffset
}

export const getTextSelectionOffsets = (root: HTMLElement, range: Range) => {
  const start = getPlainTextOffset(root, range.startContainer, range.startOffset)

  return {
    from: start,
    to: range.collapsed ? start : getPlainTextOffset(root, range.endContainer, range.endOffset)
  }
}

// scrollSelectionIntoView

export const scrollSelectionIntoView = (): void => {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  if (range.commonAncestorContainer === document) return

  const parent = range.commonAncestorContainer.parentElement
  if (!parent) return

  const parentRect = parent.getBoundingClientRect()
  const delta = range.getBoundingClientRect().bottom - parentRect.bottom

  if (delta > 0) {
    parent.scrollBy({ top: delta })
  }
}

// normalizeEditorText

export const normalizeEditorText = (text: string): string => {
  return text.replace(/&nbsp;/gi, ' ').replace(/<br\s*\/?>/gi, '\n')
}
