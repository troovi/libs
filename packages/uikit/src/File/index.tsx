import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useMemo, useRef } from 'react'

export interface FileOverlayProps {
  multiple?: true
  onChange?: (file: File[]) => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
  mimes?: ('image' | 'video' | 'audio' | 'text' | 'application')[]
}

// Интерактивные элементы (button, a, input) внутри <label>
// прерывают нативную активацию связанного <input>.

const FileOverlay = ({
  onChange,
  disabled,
  children,
  multiple,
  mimes,
  className
}: FileOverlayProps) => {
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

    if (e.target.files) {
      onChange?.(Array.from(e.target.files))
    }

    if (ref.current) {
      ref.current.value = ''
    }
  }

  const accept = useMemo(() => {
    if (mimes) {
      return mimes.map((mime) => `${mime}/*`).join(',')
    }
  }, [mimes])

  return (
    <label className={className}>
      {children}
      <VisuallyHidden asChild>
        <input
          ref={ref}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
        />
      </VisuallyHidden>
    </label>
  )
}

export { FileOverlay }
