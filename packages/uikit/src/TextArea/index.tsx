import { useResizeTextarea } from '../__hooks/use-resize'
import { attr, callMultiple } from '@troovi/utils-browser'
import { useEffect } from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Свойство управляющее автоматическим изменением высоты компонента.
   */
  grow?: boolean
  /**
   * Обработчик, срабатывающий при изменении размера компонента.
   */
  onResize?: (el: HTMLTextAreaElement) => void
  fill?: boolean
}

export const TextArea = ({
  onResize,
  grow = false,
  value,
  onChange,
  disabled,
  required,
  rows = 2,
  fill = false,
  ...textAreaProps
}: TextAreaProps) => {
  const [refResizeTextarea, resize] = useResizeTextarea(onResize, grow)

  useEffect(resize, [resize, value])

  return (
    <div
      className="form form-textarea"
      data-required={attr(required)}
      data-disabled={attr(disabled)}
      data-fill={attr(fill)}
    >
      <textarea
        className="form-input"
        data-grow={attr(grow)}
        value={value}
        ref={refResizeTextarea}
        rows={rows}
        disabled={disabled}
        onChange={callMultiple(onChange, resize)}
        {...textAreaProps}
      />
    </div>
  )
}
