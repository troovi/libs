import { escape, isElementNode, unescape } from '@companix/utils-browser'
import { onElementKeyDownFactory } from './keyboard'
import {
  getEditorSelection,
  getNodeTextContent,
  getTextSelectionOffsets,
  normalizeEditorText,
  scrollSelectionIntoView
} from './utils'

interface TextSelection {
  from: number
  to: number
}

interface EditorHandlers {
  contentChange: Set<(text: string, selection: TextSelection) => void>
  paste?: (files: File[]) => void
  keyCombo?: (combo: string, event: KeyboardEvent) => void
  focusChange?: (focused: boolean) => void
}

export class Editor {
  private element: HTMLSpanElement
  private prevText = ''
  private prevTextSelection: TextSelection = { from: 0, to: 0 }
  private handlers: EditorHandlers = {
    contentChange: new Set()
  }

  constructor(element: HTMLSpanElement) {
    if (element.contentEditable !== 'true') {
      throw new Error('Элемент эдитора должен быть contentEditable')
    }

    if (element.tagName !== 'SPAN') {
      console.warn('Используйте элемент span')
    }

    this.element = element
    this.element.translate = false
  }

  getElement(): HTMLSpanElement {
    return this.element
  }

  onPaste(handler: (files: File[]) => void): () => void {
    if (!this.handlers.paste) {
      this.element.addEventListener('paste', this.handlePaste)
    }

    this.handlers.paste = handler

    return () => {
      this.handlers.paste = undefined
      this.element.removeEventListener('paste', this.handlePaste)
    }
  }

  onKeyCombo(handler: (combo: string | null, event: KeyboardEvent) => void): () => void {
    const listener = onElementKeyDownFactory(handler) as EventListener

    this.element.addEventListener('keydown', listener)
    this.handlers.keyCombo = handler

    return () => {
      this.handlers.keyCombo = undefined
      this.element.removeEventListener('keydown', listener)
    }
  }

  onFocusChange(handler: (focused: boolean) => void): () => void {
    if (!this.handlers.focusChange) {
      this.element.addEventListener('focus', this.handleFocus)
      this.element.addEventListener('blur', this.handleBlur)
    }

    this.handlers.focusChange = handler

    return () => {
      this.handlers.focusChange = undefined
      this.element.removeEventListener('focus', this.handleFocus)
      this.element.removeEventListener('blur', this.handleBlur)
    }
  }

  onContentChange(handler: (text: string, selection: TextSelection) => void): () => void {
    if (this.handlers.contentChange.size === 0) {
      this.element.addEventListener('keyup', this.checkContentChanged)
      document.addEventListener('selectionchange', this.checkContentChanged)
    }

    this.handlers.contentChange.add(handler)

    return () => {
      this.handlers.contentChange.delete(handler)

      if (this.handlers.contentChange.size === 0) {
        this.element.removeEventListener('keyup', this.checkContentChanged)
        document.removeEventListener('selectionchange', this.checkContentChanged)
      }
    }
  }

  onMouseDown(): () => void {
    this.element.addEventListener('mousedown', this.handleMouseDown)

    return () => {
      this.element.removeEventListener('mousedown', this.handleMouseDown)
    }
  }

  setSelection(selection: TextSelection): void {
    const selectionResult = getEditorSelection(this.element)

    if (!('selection' in selectionResult)) return

    const range = document.createRange()
    const start = this.resolveDomPosition(selection.from)
    const end = this.resolveDomPosition(selection.to)

    range.setStart(start.container, start.offset)
    range.setEnd(end.container, end.offset)

    selectionResult.selection.removeAllRanges()
    selectionResult.selection.addRange(range)
  }

  // вставить переданный текст в текущую выделенную область/позицию курсора внутри contenteditable
  insertAtSelection(text: string, selection?: TextSelection): void {
    if (selection) {
      this.setSelection(selection)
    }

    const chunks = toTextChunksLite(escape(text))

    for (const chunk of chunks) {
      switch (chunk.kind) {
        case 'Text':
          document.execCommand('insertText', false, unescape(chunk.text))
          break
        // case 'Emoji': {
        //   const emojiNode = createEmojiElement(chunk.text)
        //   if (isTextNode(emojiNode)) {
        //     document.execCommand('insertText', false, emojiNode.nodeValue || '')
        //   } else if (emojiNode instanceof HTMLElement) {
        //     document.execCommand('insertHtml', false, emojiNode.outerHTML)
        //   }
        //   break
        // }
      }
    }

    this.checkContentChanged()
  }

  removeFormat(): void {
    document.execCommand('removeFormat')
  }

  resetText(text = '', asHtml = false, focusEditor = true): void {
    const shouldPreserveFocus = !this.isFocused() && !focusEditor

    this.element.innerText = ''

    const previousActiveElement = document.activeElement as HTMLElement | null
    const previousInputMode = this.element.inputMode

    if (shouldPreserveFocus) {
      this.element.inputMode = 'none'
    }

    this.element.focus()
    document.execCommand('removeFormat')

    if (asHtml) {
      document.execCommand('inserthtml', false, text)
    } else {
      this.insertAtSelection(normalizeEditorText(text))
    }

    if (shouldPreserveFocus) {
      this.element.blur()
      this.element.inputMode = previousInputMode
      previousActiveElement?.focus?.()
    }

    this.checkContentChanged()
  }

  getText(): string {
    let text = ''
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    )

    while (walker.nextNode()) {
      text += getNodeTextContent(walker.currentNode)
    }

    return normalizeEditorText(text)
  }

  getHtml(): string {
    return this.element.innerHTML
  }

  getHtmlWithEmojisAsText(): string {
    const html = this.element.innerHTML
    const emojiTagRegex = /<img class="Emoji .+?" src=".+?" alt=".+?">/
    const altRegex = /alt=".+?"/

    const replaceEmojiImages = (input: string): string => {
      const tagMatch = input.match(emojiTagRegex)
      if (!tagMatch?.[0]) return input

      const altMatch = tagMatch[0].match(altRegex)
      if (!altMatch?.[0]) return input

      const altText = altMatch[0].replace('alt=', '').replaceAll('"', '')
      return replaceEmojiImages(input.replace(tagMatch[0], altText))
    }

    return replaceEmojiImages(html)
  }

  focus(atStart = false): void {
    if (this.isFocused()) return

    this.element.focus()

    const selectionResult = getEditorSelection(this.element)
    if (!('selection' in selectionResult)) return

    selectionResult.selection.selectAllChildren(this.element)

    if (atStart) {
      selectionResult.selection.collapseToStart()
    } else {
      selectionResult.selection.collapseToEnd()
    }

    scrollSelectionIntoView()
  }

  isFocused(): boolean {
    return document.activeElement === this.element
  }

  setDisabled(disabled: boolean): void {
    this.element.contentEditable = disabled ? 'false' : 'true'
  }

  private handlePaste = async (event: ClipboardEvent): Promise<void> => {
    event.preventDefault()

    const { clipboardData } = event
    if (!clipboardData) return

    const text = clipboardData.getData('text')

    if (text) {
      this.insertAtSelection(text)
      scrollSelectionIntoView()
      return
    }

    // const files = await getFilesFromDataTransferItems(clipboardData.items)

    // if (files) {
    //   this.handlers.paste?.(files)
    // }
  }

  private handleFocus = (): void => {
    this.handlers.focusChange?.(true)
  }

  private handleBlur = (): void => {
    this.handlers.focusChange?.(false)
  }

  private handleMouseDown = (event: MouseEvent): void => {
    if (!(event.target instanceof HTMLImageElement)) return

    const range = new Range()
    const selection = window.getSelection()

    if (!selection) return

    range.selectNode(event.target)
    range.collapse(event.offsetX <= 8)

    selection.removeAllRanges()
    selection.addRange(range)
  }

  private checkContentChanged = (): void => {
    const text = normalizeEditorText(this.getText())
    const selectionResult = getEditorSelection(this.element)

    if (!('range' in selectionResult)) return

    const selection = getTextSelectionOffsets(this.element, selectionResult.range)

    if (
      text === this.prevText &&
      selection.from === this.prevTextSelection.from &&
      selection.to === this.prevTextSelection.to
    ) {
      return
    }

    const shouldReset = text === '\n' && this.prevText.length > 0

    this.prevText = text
    this.prevTextSelection = selection

    if (shouldReset) {
      this.resetText('')
      return
    }

    this.handlers.contentChange.forEach((handler) => handler(text, selection))
  }

  private resolveDomPosition(offset: number): { container: Node; offset: number } {
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    )

    let remaining = offset

    while (walker.nextNode()) {
      const node = walker.currentNode
      const nodeLength = getNodeTextContent(node).length

      if (nodeLength >= remaining) {
        if (isElementNode(node) && node.nodeName === 'BR') {
          remaining -= 1
        }

        return {
          container: node,
          offset: Math.max(remaining, 0)
        }
      }

      remaining -= nodeLength
    }

    return {
      container: this.element,
      offset: this.element.childNodes.length
    }
  }
}

interface TextChunk {
  kind: 'Text'
  text: string
}

export const toTextChunksLite = (input: string): TextChunk[] => {
  if (!input) {
    return []
  }

  return [{ kind: 'Text', text: input }]
}
