import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Editor } from './Editor'

interface WriteBarInputProps {
  id?: string
  className?: string
  inputClassName: string
  placeholderClassName?: string
  placeholder?: string
  value?: string
  inputMode?: 'text'
  onClick?: React.MouseEventHandler<HTMLDivElement>
  onCreate: (editor: Editor) => void
}

export const WriteBarInput = (props: WriteBarInputProps) => {
  const {
    id,
    className,
    inputClassName,
    placeholderClassName,
    placeholder,
    value,
    inputMode,
    onCreate,
    onClick
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLSpanElement | null>(null)

  const [isEmpty, setIsEmpty] = useState(true)

  useLayoutEffect(() => {
    const input = document.createElement('span')

    input.setAttribute('contenteditable', 'true')
    input.setAttribute('class', inputClassName)
    input.dataset.placeholder = placeholder

    if (id) {
      input.setAttribute('id', id)
    }

    if (inputMode) {
      input.setAttribute('inputmode', inputMode)
    }

    if (containerRef.current) {
      containerRef.current.appendChild(input)
    }

    const editor = new Editor(input)

    const unsubscribe = editor.onContentChange((text) => {
      setIsEmpty(text.length === 0)
    })

    onCreate(editor)
    inputRef.current = input

    return () => {
      unsubscribe()
      inputRef.current = null
      input.remove()
    }
  }, [])

  useEffect(() => {
    const input = inputRef.current

    if (!input) {
      return
    }

    if (id) {
      input.setAttribute('id', id)
    }

    if (inputMode) {
      input.setAttribute('inputmode', inputMode)
    }

    // Внешняя синхронизация value

    if (value) {
      input.textContent = value
      setIsEmpty(false)
    }

    input.setAttribute('class', inputClassName)
    input.setAttribute('role', 'textbox')
    input.setAttribute('aria-multiline', 'true')

    if (placeholder) {
      input.setAttribute('aria-label', placeholder)
    }
  }, [id, inputClassName, inputMode, placeholder, value])

  return (
    <div role="presentation" className={className}>
      {isEmpty && (
        <span aria-hidden="true" className={placeholderClassName}>
          {placeholder}
        </span>
      )}
      <div role="presentation" ref={containerRef} onClick={onClick} />
    </div>
  )
}
